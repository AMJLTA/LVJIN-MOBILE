/**
 * 机械臂通信协议 + 客户端类型定义
 */

export const JOINT_NAMES = ['J1', 'J2', 'J3', 'J4', 'J5', 'J6'] as const
export type JointIndex = 0 | 1 | 2 | 3 | 4 | 5

export interface RobotState {
  /** 6 个关节角度，单位：度 */
  joints: [number, number, number, number, number, number]
  /** 6 个电机温度，单位：摄氏度 */
  temps: [number, number, number, number, number, number]
  /** 末端笛卡尔位姿 [x, y, z, roll, pitch, yaw]，xyz 单位米，rpy 单位度 */
  pose: [number, number, number, number, number, number]
  /** 是否处于急停状态 */
  estop: boolean
  /** 是否处于重力补偿（拖动）模式 */
  gravComp: boolean
  /** 控制模式：joint / cartesian */
  mode: 'joint' | 'cart'
  /** 服务端时间戳（毫秒） */
  ts: number
}

export type ServerMessage =
  | { t: 'state'; payload: RobotState }
  | { t: 'ack'; ref: string }
  | { t: 'error'; message: string }
  | { t: 'episode_started'; id: string; name: string }
  | { t: 'episode_stopped'; id: string; frames: number }

export type ClientMessage =
  | { t: 'cmd'; mode: 'joint'; target: number[] }
  | { t: 'cmd'; mode: 'cart'; xyz: [number, number, number]; rpy: [number, number, number] }
  | { t: 'estop' }
  | { t: 'release_estop' }
  | { t: 'grav_comp'; on: boolean }
  | { t: 'record'; action: 'start' | 'stop'; name?: string }
  | { t: 'home' }

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error'

export interface SavedRobot {
  id: string
  name: string
  url: string // ws://192.168.1.10:8765
  addedAt: number
  lastConnectedAt?: number
}

export interface Episode {
  id: string
  name: string
  createdAt: number
  frames: number
  durationMs: number
}
