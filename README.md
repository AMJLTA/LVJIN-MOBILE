# 绿晋机械臂 · 移动遥控器 (greenjin-mobile)

[LVJIN ROBOTICS](https://github.com/AMJLTA/so101-guide-web) 旗下 SO101 机械臂的官方 iOS / Android 配套 App。
通过 Wi-Fi 直连机械臂，提供实时监控、手势遥控、数据采集与远程急停。

> 当前为 **MVP 0.1.0**，自带模拟设备，无需真机即可走完完整流程。

## 功能

- 🟢 **实时监控**：6 轴关节角度 / 电机温度 / 末端笛卡尔位姿 / 急停状态
- 🎮 **遥控操作**：单关节滑动控制、4 个预设姿态、回零、重力补偿、随机姿态
- 🛑 **紧急停止**：大圆按钮 + 触觉反馈，再按一下解除
- 📹 **数据采集**：录制 episode，关节状态与时间戳自动同步保存
- 🔌 **多设备**：支持 Wi-Fi WebSocket，BLE / USB OTG 在路线图上
- 🎭 **模拟设备**：内置 Mock，关节会缓慢呼吸跟随命令

## 技术栈

| 用途 | 库 |
|------|------|
| 框架 | Expo SDK 54 · React Native 0.81 · React 19 |
| 路由 | Expo Router 6（文件式路由 + typed routes） |
| 样式 | NativeWind v4 (Tailwind on RN) |
| 动效 | Reanimated 4 + Worklets |
| 手势 | react-native-gesture-handler |
| 状态 | Zustand + AsyncStorage 持久化 |
| 图形 | react-native-svg |
| 触觉 | expo-haptics |
| 相机 | expo-camera（数据采集预留） |

## 项目结构

```
greenjin-mobile/
├── app/                      ← Expo Router (类似 Next.js App Router)
│   ├── _layout.tsx           ← 根 Stack
│   ├── index.tsx             ← 启动重定向到 monitor
│   ├── connect.tsx           ← 添加机械臂（modal）
│   └── (tabs)/
│       ├── _layout.tsx       ← 底部 4 Tab
│       ├── monitor.tsx       ← 监控
│       ├── control.tsx       ← 遥控
│       ├── record.tsx        ← 采集
│       └── settings.tsx      ← 设置
├── components/
│   ├── arm-visualizer.tsx    ← SVG 2D 机械臂示意（关节驱动）
│   ├── joint-bar.tsx         ← 关节角度只读条
│   ├── joint-slider.tsx      ← 关节滑动条 (Reanimated)
│   ├── emergency-stop.tsx    ← 急停大按钮
│   └── connection-status.tsx ← 顶部连接状态徽章
├── lib/
│   ├── types.ts              ← 通信协议类型
│   ├── theme.ts              ← 配色 + 关节范围常量
│   ├── robot-client.ts       ← WebSocket 客户端（含自动重连）
│   ├── mock-robot.ts         ← 模拟机械臂数据源
│   └── store.ts              ← Zustand store + 持久化
└── bridge/
    ├── greenjin_bridge.py    ← PC 端示例 WebSocket bridge
    └── requirements.txt
```

## 启动

### 1. 安装依赖

```bash
cd greenjin-mobile
npm install
```

### 2. 启动 Expo 开发服务器

```bash
npm start          # 启 metro
npm run android    # 或 Android
npm run ios        # 或 iOS（需要 Mac）
npm run web        # 或 Web 浏览器
```

第一次运行时，下载 **Expo Go** App，扫描终端二维码即可在手机上运行。
所有 mock 数据会自动跑起来，不需要硬件。

### 3. 连接真实机械臂（可选）

#### 3.1 在 PC 上跑 bridge

```bash
cd bridge
pip install -r requirements.txt
python greenjin_bridge.py
```

终端会打印 `ws://0.0.0.0:8765`。把 `0.0.0.0` 换成 PC 的局域网 IP（如 `192.168.1.10`），手机上填这个地址。

#### 3.2 App 内添加设备

设置 → 添加机械臂 → 填名称和 `ws://192.168.x.x:8765` → 保存并连接

#### 3.3 接入真实 LeRobot

`bridge/greenjin_bridge.py` 里的 `FakeRobot` 类是占位实现。
把它换成调用 LeRobot 的 `robot.get_observation()` / `robot.send_action()` API 即可。

## 通信协议

详见 [`lib/types.ts`](lib/types.ts)。JSON over WebSocket。

**服务端 → 客户端**：
```json
{ "t": "state", "payload": {
  "joints": [10.2, -45.1, 90, 0, 30, 0],
  "temps":  [45, 42, 40, 38, 41, 39],
  "pose":   [0.3, 0.0, 0.2, 0, 0, 0],
  "estop":  false, "gravComp": false,
  "mode":   "joint", "ts": 1700000000000
}}
```

**客户端 → 服务端**：
```json
{ "t": "cmd", "mode": "joint", "target": [10, -45, 90, 0, 30, 0] }
{ "t": "estop" }
{ "t": "grav_comp", "on": true }
{ "t": "record", "action": "start", "name": "pick_place_001" }
```

## 商业相关

- 📧 销售 / 询价：sales@greenjin.tech
- 🌐 官网：https://so101.greenjin.tech
- 📦 GitHub：https://github.com/AMJLTA/so101-guide-web

## 路线图

- [ ] BLE 直连（无需 PC，手机直接连机械臂）
- [ ] USB OTG（Android 直插）
- [ ] expo-camera 接入数据采集摄像头流
- [ ] 笛卡尔模式（XYZ + RPY 滑块）
- [ ] 多机集群管理
- [ ] 云端协作（远程多人观看）
- [ ] OTA 固件升级
- [ ] 苹果商店 / Google Play 上架

## License

MIT © 绿晋科技 LVJIN ROBOTICS
