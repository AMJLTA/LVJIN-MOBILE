"""
greenjin-bridge
---------------
把 LeRobot 控制的机械臂暴露成一个 WebSocket 服务，
让 greenjin-mobile App 可以通过 Wi-Fi 远程监控与遥控。

依赖：
    pip install websockets numpy

协议（与 lib/types.ts 对齐）：

  服务端 → 客户端（推送）
    { "t": "state",
      "payload": {
        "joints": [...],
        "temps":  [...],
        "pose":   [x,y,z,r,p,y],
        "estop":  false,
        "gravComp": false,
        "mode": "joint",
        "ts": 1700000000000
      } }

  服务端 → 客户端（事件）
    { "t": "ack",  "ref": "..."   }
    { "t": "error","message": "..." }
    { "t": "episode_started", "id": "...", "name": "..." }
    { "t": "episode_stopped", "id": "...", "frames": 0 }

  客户端 → 服务端
    { "t": "cmd", "mode": "joint", "target": [..6 个角度] }
    { "t": "cmd", "mode": "cart",  "xyz": [...], "rpy": [...] }
    { "t": "estop" }
    { "t": "release_estop" }
    { "t": "grav_comp", "on": true }
    { "t": "record", "action": "start", "name": "..." }
    { "t": "record", "action": "stop" }
    { "t": "home" }

如何接入真实机械臂：
    用 LeRobot 提供的 robot.get_observation() / robot.send_action() API
    替换下面 FakeRobot 的实现即可。
"""

import asyncio
import json
import math
import time
from dataclasses import dataclass, field
from typing import Any

import websockets


# ============================================================
# 占位机械臂 —— 把这里换成真实的 LeRobot 适配
# ============================================================
@dataclass
class FakeRobot:
    joints: list[float] = field(default_factory=lambda: [0.0, -30.0, 60.0, 0.0, 30.0, 0.0])
    target: list[float] = field(default_factory=lambda: [0.0, -30.0, 60.0, 0.0, 30.0, 0.0])
    temps: list[float] = field(default_factory=lambda: [40.0, 40.0, 40.0, 40.0, 40.0, 40.0])
    estop: bool = False
    grav_comp: bool = False
    mode: str = "joint"
    t0: float = field(default_factory=time.time)
    recording_id: str | None = None
    recording_name: str = ""
    record_start: float = 0.0
    frames: int = 0

    def step(self):
        """每个 tick 调用一次：把 current 朝 target 推进一小步。"""
        if self.estop:
            return
        for i in range(6):
            self.joints[i] += (self.target[i] - self.joints[i]) * 0.08
        # 模拟温度上升
        for i in range(6):
            self.temps[i] = 38 + i * 1.5 + math.sin(time.time() + i) * 0.6

    def set_target(self, target: list[float]):
        if not self.estop:
            self.target = list(target)

    def pose(self) -> list[float]:
        a1 = math.radians(self.joints[0])
        a2 = math.radians(self.joints[1])
        r = 0.4
        return [
            r * math.cos(a1) * math.cos(a2),
            r * math.sin(a1) * math.cos(a2),
            0.3 + r * math.sin(a2),
            self.joints[3],
            self.joints[4],
            self.joints[5],
        ]

    def snapshot(self) -> dict:
        if self.recording_id:
            self.frames += 1
        return {
            "joints": [round(j, 3) for j in self.joints],
            "temps": [round(t, 2) for t in self.temps],
            "pose": [round(p, 4) for p in self.pose()],
            "estop": self.estop,
            "gravComp": self.grav_comp,
            "mode": self.mode,
            "ts": int(time.time() * 1000),
        }


# ============================================================
# WebSocket 服务端
# ============================================================
class Server:
    def __init__(self, host: str = "0.0.0.0", port: int = 8765, hz: int = 30):
        self.host = host
        self.port = port
        self.hz = hz
        self.robot = FakeRobot()
        self.clients: set[Any] = set()

    async def handle_client(self, ws):
        self.clients.add(ws)
        peer = ws.remote_address
        print(f"[bridge] client connected: {peer}")
        try:
            async for raw in ws:
                try:
                    msg = json.loads(raw)
                except json.JSONDecodeError:
                    await ws.send(json.dumps({"t": "error", "message": "bad json"}))
                    continue
                await self.handle_message(msg, ws)
        except websockets.ConnectionClosed:
            pass
        finally:
            self.clients.discard(ws)
            print(f"[bridge] client disconnected: {peer}")

    async def handle_message(self, msg: dict, ws):
        t = msg.get("t")
        if t == "cmd":
            mode = msg.get("mode")
            self.robot.mode = mode
            if mode == "joint":
                target = msg.get("target", [])
                if len(target) == 6:
                    self.robot.set_target(target)
            elif mode == "cart":
                # 真实情况这里用 IK 求解 joint target
                pass
        elif t == "estop":
            self.robot.estop = True
            print("[bridge] EMERGENCY STOP")
        elif t == "release_estop":
            self.robot.estop = False
            print("[bridge] estop released")
        elif t == "grav_comp":
            self.robot.grav_comp = bool(msg.get("on", False))
        elif t == "home":
            self.robot.set_target([0.0, -30.0, 60.0, 0.0, 30.0, 0.0])
        elif t == "record":
            action = msg.get("action")
            name = msg.get("name", "episode")
            if action == "start":
                ep_id = f"ep-{int(time.time())}"
                self.robot.recording_id = ep_id
                self.robot.recording_name = name
                self.robot.record_start = time.time()
                self.robot.frames = 0
                await self.broadcast({"t": "episode_started", "id": ep_id, "name": name})
                print(f"[bridge] start recording {name}")
            elif action == "stop" and self.robot.recording_id:
                await self.broadcast(
                    {
                        "t": "episode_stopped",
                        "id": self.robot.recording_id,
                        "frames": self.robot.frames,
                    }
                )
                print(
                    f"[bridge] stop recording, {self.robot.frames} frames, "
                    f"{time.time() - self.robot.record_start:.1f}s"
                )
                self.robot.recording_id = None

    async def broadcast(self, payload: dict):
        if not self.clients:
            return
        data = json.dumps(payload)
        results = await asyncio.gather(
            *[c.send(data) for c in self.clients], return_exceptions=True
        )
        for r in results:
            if isinstance(r, Exception):
                pass  # 客户端断开时下次会被清理

    async def state_loop(self):
        period = 1.0 / self.hz
        while True:
            self.robot.step()
            await self.broadcast({"t": "state", "payload": self.robot.snapshot()})
            await asyncio.sleep(period)

    async def run(self):
        print(f"[bridge] listening on ws://{self.host}:{self.port}")
        print("[bridge] in mobile app: 设置 → 添加机械臂 → 填这个地址")
        async with websockets.serve(self.handle_client, self.host, self.port):
            await self.state_loop()


# ============================================================
# 入口
# ============================================================
if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser()
    parser.add_argument("--host", default="0.0.0.0")
    parser.add_argument("--port", type=int, default=8765)
    parser.add_argument("--hz", type=int, default=30, help="状态推送频率")
    args = parser.parse_args()

    server = Server(args.host, args.port, args.hz)
    try:
        asyncio.run(server.run())
    except KeyboardInterrupt:
        print("\n[bridge] stopped")
