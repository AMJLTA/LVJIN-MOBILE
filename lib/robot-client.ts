import type { ClientMessage, ConnectionStatus, ServerMessage } from './types'

type Listener<T> = (msg: T) => void

interface RobotClientOptions {
  url: string
  onMessage: Listener<ServerMessage>
  onStatusChange: Listener<ConnectionStatus>
  /** 重连间隔 ms */
  reconnectInterval?: number
  /** 最多重连次数，-1 表示无限 */
  maxReconnect?: number
}

/**
 * 机械臂 WebSocket 客户端
 * - 自动重连
 * - 错误处理
 * - 类型安全的 send
 */
export class RobotClient {
  private ws: WebSocket | null = null
  private opts: Required<RobotClientOptions>
  private reconnectAttempts = 0
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private intentionallyClosed = false

  constructor(opts: RobotClientOptions) {
    this.opts = {
      reconnectInterval: 2000,
      maxReconnect: -1,
      ...opts
    }
  }

  connect() {
    this.intentionallyClosed = false
    this.setStatus('connecting')
    try {
      this.ws = new WebSocket(this.opts.url)
    } catch (e) {
      this.handleError(e)
      return
    }

    this.ws.onopen = () => {
      this.reconnectAttempts = 0
      this.setStatus('connected')
    }

    this.ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(typeof event.data === 'string' ? event.data : '{}') as ServerMessage
        this.opts.onMessage(msg)
      } catch (e) {
        console.warn('[robot-client] failed to parse message', e)
      }
    }

    this.ws.onerror = (e) => {
      console.warn('[robot-client] error', e)
    }

    this.ws.onclose = () => {
      if (this.intentionallyClosed) {
        this.setStatus('disconnected')
        return
      }
      this.setStatus('error')
      this.scheduleReconnect()
    }
  }

  disconnect() {
    this.intentionallyClosed = true
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    this.ws?.close()
    this.ws = null
  }

  send(msg: ClientMessage) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('[robot-client] not connected; dropping msg', msg)
      return false
    }
    try {
      this.ws.send(JSON.stringify(msg))
      return true
    } catch (e) {
      console.warn('[robot-client] send failed', e)
      return false
    }
  }

  private setStatus(s: ConnectionStatus) {
    this.opts.onStatusChange(s)
  }

  private handleError(e: unknown) {
    console.warn('[robot-client] connect error', e)
    this.setStatus('error')
    this.scheduleReconnect()
  }

  private scheduleReconnect() {
    if (this.opts.maxReconnect >= 0 && this.reconnectAttempts >= this.opts.maxReconnect) {
      return
    }
    this.reconnectAttempts++
    this.reconnectTimer = setTimeout(() => this.connect(), this.opts.reconnectInterval)
  }
}
