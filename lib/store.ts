import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { MockRobot } from './mock-robot'
import { RobotClient } from './robot-client'
import type {
  ConnectionStatus,
  RobotState,
  SavedRobot,
  ClientMessage
} from './types'

const INITIAL_STATE: RobotState = {
  joints: [0, -30, 60, 0, 30, 0],
  temps: [38, 39, 40, 38, 39, 40],
  pose: [0.4, 0, 0.4, 0, 0, 0],
  estop: false,
  gravComp: false,
  mode: 'joint',
  ts: Date.now()
}

// 已连接客户端的全局单例（不放进 store 避免序列化）
let activeClient: RobotClient | null = null
let activeMock: MockRobot | null = null

interface RobotStore {
  /** 保存过的机械臂列表 */
  saved: SavedRobot[]
  /** 当前选中的机械臂 ID（null 表示用 mock） */
  activeId: string | null
  /** 实时状态 */
  state: RobotState
  /** 连接状态 */
  status: ConnectionStatus
  /** 是否在 mock 模式 */
  isMock: boolean
  /** 当前 episode（采集中） */
  recordingEpisode: { id: string; name: string; startedAt: number } | null

  // actions
  addRobot: (robot: Omit<SavedRobot, 'id' | 'addedAt'>) => void
  removeRobot: (id: string) => void
  connect: (id: string | null) => void
  disconnect: () => void
  send: (msg: ClientMessage) => void
  setEstop: (on: boolean) => void
  setGravComp: (on: boolean) => void
  jogJoints: (target: number[]) => void
  homePosition: () => void
  startRecord: (name: string) => void
  stopRecord: () => void
  _updateState: (s: RobotState) => void
  _setStatus: (s: ConnectionStatus) => void
}

export const useRobotStore = create<RobotStore>()(
  persist(
    (set, get) => ({
      saved: [],
      activeId: null,
      state: INITIAL_STATE,
      status: 'disconnected',
      isMock: true,
      recordingEpisode: null,

      addRobot: (robot) => {
        const id = `r-${Date.now()}`
        set((s) => ({
          saved: [...s.saved, { ...robot, id, addedAt: Date.now() }]
        }))
      },

      removeRobot: (id) => {
        set((s) => ({
          saved: s.saved.filter((r) => r.id !== id),
          activeId: s.activeId === id ? null : s.activeId
        }))
        if (get().activeId === id) {
          get().disconnect()
        }
      },

      connect: (id) => {
        // 断旧
        activeClient?.disconnect()
        activeClient = null
        activeMock?.stop()
        activeMock = null

        const isMock = id === null
        set({ activeId: id, isMock, status: 'connecting' })

        if (isMock) {
          activeMock = new MockRobot({
            hz: 30,
            onState: (s) => get()._updateState(s)
          })
          activeMock.start()
          set({ status: 'connected' })
          return
        }

        const robot = get().saved.find((r) => r.id === id)
        if (!robot) {
          set({ status: 'error' })
          return
        }

        activeClient = new RobotClient({
          url: robot.url,
          onStatusChange: (s) => get()._setStatus(s),
          onMessage: (msg) => {
            if (msg.t === 'state') {
              get()._updateState(msg.payload)
            } else if (msg.t === 'episode_started') {
              set({
                recordingEpisode: {
                  id: msg.id,
                  name: msg.name,
                  startedAt: Date.now()
                }
              })
            } else if (msg.t === 'episode_stopped') {
              set({ recordingEpisode: null })
            }
          }
        })
        activeClient.connect()
      },

      disconnect: () => {
        activeClient?.disconnect()
        activeClient = null
        activeMock?.stop()
        activeMock = null
        set({ status: 'disconnected', recordingEpisode: null })
      },

      send: (msg) => {
        if (activeClient) {
          activeClient.send(msg)
        } else if (activeMock) {
          // mock 模式：直接修改 mock 状态
          if (msg.t === 'cmd' && msg.mode === 'joint') {
            activeMock.setTarget(msg.target)
          } else if (msg.t === 'estop') {
            activeMock.setEstop(true)
          } else if (msg.t === 'release_estop') {
            activeMock.setEstop(false)
          } else if (msg.t === 'grav_comp') {
            activeMock.setGravComp(msg.on)
          } else if (msg.t === 'home') {
            activeMock.setTarget([0, -30, 60, 0, 30, 0])
          } else if (msg.t === 'record' && msg.action === 'start') {
            set({
              recordingEpisode: {
                id: `mock-${Date.now()}`,
                name: msg.name ?? 'untitled',
                startedAt: Date.now()
              }
            })
          } else if (msg.t === 'record' && msg.action === 'stop') {
            set({ recordingEpisode: null })
          }
        }
      },

      setEstop: (on) => {
        get().send(on ? { t: 'estop' } : { t: 'release_estop' })
      },

      setGravComp: (on) => {
        get().send({ t: 'grav_comp', on })
      },

      jogJoints: (target) => {
        get().send({ t: 'cmd', mode: 'joint', target })
      },

      homePosition: () => {
        get().send({ t: 'home' })
      },

      startRecord: (name) => {
        get().send({ t: 'record', action: 'start', name })
      },

      stopRecord: () => {
        get().send({ t: 'record', action: 'stop' })
      },

      _updateState: (s) => set({ state: s }),
      _setStatus: (s) => set({ status: s })
    }),
    {
      name: 'greenjin-robot-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // 仅持久化用户配置，不持久化运行时状态
      partialize: (s) => ({ saved: s.saved, activeId: s.activeId })
    }
  )
)
