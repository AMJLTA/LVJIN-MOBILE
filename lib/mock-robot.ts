/**
 * Mock 机械臂数据源 —— 用于无硬件开发 / 演示
 * 模拟一个真实机械臂在缓慢绕圈，关节角度像呼吸一样波动
 */

import type { RobotState } from './types'

interface MockOptions {
  onState: (s: RobotState) => void
  /** 推送频率 Hz */
  hz?: number
}

export class MockRobot {
  private timer: ReturnType<typeof setInterval> | null = null
  private t0 = performance.now()
  private mode: 'joint' | 'cart' = 'joint'
  private estop = false
  private gravComp = false
  /** 用户给的目标关节角度 */
  private target: number[] = [0, -30, 60, 0, 30, 0]
  /** 当前关节角度 */
  private current: number[] = [0, -30, 60, 0, 30, 0]

  constructor(private opts: MockOptions) {}

  start() {
    if (this.timer) return
    const period = 1000 / (this.opts.hz ?? 30)
    this.timer = setInterval(() => this.tick(), period)
  }

  stop() {
    if (this.timer) clearInterval(this.timer)
    this.timer = null
  }

  setTarget(target: number[]) {
    this.target = target
  }

  setEstop(on: boolean) {
    this.estop = on
  }

  setGravComp(on: boolean) {
    this.gravComp = on
  }

  setMode(mode: 'joint' | 'cart') {
    this.mode = mode
  }

  private tick() {
    const now = performance.now()
    const dt = (now - this.t0) / 1000

    if (!this.estop) {
      // 简单一阶滤波让 current 缓慢接近 target
      const k = 0.08
      this.current = this.current.map((c, i) => c + (this.target[i] - c) * k)
    }

    // 在 current 基础上叠加微小呼吸抖动
    const breath = Math.sin(dt * 0.7) * 0.5
    const joints = this.current.map((c) => c + breath) as RobotState['joints']
    // 模拟温度缓慢上升
    const baseTemp = 38 + Math.sin(dt * 0.05) * 4
    const temps = [0, 1, 2, 3, 4, 5].map(
      (i) => baseTemp + i * 1.5 + Math.sin(dt + i) * 0.6
    ) as RobotState['temps']

    // 末端位姿（极简正向运动学：模拟）
    const r = 0.4
    const a1 = (joints[0] * Math.PI) / 180
    const a2 = (joints[1] * Math.PI) / 180
    const pose: RobotState['pose'] = [
      r * Math.cos(a1) * Math.cos(a2),
      r * Math.sin(a1) * Math.cos(a2),
      0.3 + r * Math.sin(a2),
      joints[3],
      joints[4],
      joints[5]
    ]

    this.opts.onState({
      joints,
      temps,
      pose,
      estop: this.estop,
      gravComp: this.gravComp,
      mode: this.mode,
      ts: Date.now()
    })
  }
}
