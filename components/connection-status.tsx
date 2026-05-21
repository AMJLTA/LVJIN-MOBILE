import { Pressable, Text, View } from 'react-native'
import { Cpu, Wifi, WifiOff } from 'lucide-react-native'
import { router } from 'expo-router'
import { useRobotStore } from '@/lib/store'
import { colors } from '@/lib/theme'

const STATUS_LABEL = {
  disconnected: '未连接',
  connecting: '连接中…',
  connected: '已连接',
  error: '连接异常'
} as const

const STATUS_COLOR = {
  disconnected: colors.mutedForeground,
  connecting: colors.warning,
  connected: colors.success,
  error: colors.destructive
} as const

export function ConnectionStatus({ compact = false }: { compact?: boolean }) {
  const status = useRobotStore((s) => s.status)
  const isMock = useRobotStore((s) => s.isMock)
  const activeId = useRobotStore((s) => s.activeId)
  const robot = useRobotStore((s) =>
    activeId ? s.saved.find((r) => r.id === activeId) : null
  )

  const color = STATUS_COLOR[status]
  const Icon = status === 'connected' ? Wifi : status === 'connecting' ? Cpu : WifiOff

  return (
    <Pressable
      onPress={() => router.push('/connect')}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: compact ? 10 : 14,
        paddingVertical: compact ? 6 : 8,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: pressed ? colors.muted : colors.card
      })}
    >
      <View
        style={{
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: color
        }}
      />
      <Icon color={colors.foreground} size={14} />
      <Text style={{ color: colors.foreground, fontSize: 12, fontWeight: '500' }}>
        {isMock ? '模拟设备' : (robot?.name ?? '选择设备')}
      </Text>
      {!compact && (
        <Text style={{ color, fontSize: 11 }}>{STATUS_LABEL[status]}</Text>
      )}
    </Pressable>
  )
}
