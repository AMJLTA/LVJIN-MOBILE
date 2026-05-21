import { View, Text } from 'react-native'
import { colors, JOINT_LIMITS } from '@/lib/theme'

interface JointBarProps {
  index: number
  value: number
  /** 单位标识 */
  unit?: string
}

/**
 * 关节角度条 —— 中心对齐 0°，左右延伸表示正负
 */
export function JointBar({ index, value, unit = '°' }: JointBarProps) {
  const [min, max] = JOINT_LIMITS[index]
  const range = max - min
  const center = (min + max) / 2
  // 把 value 映射到 0-100% 的"距离中心"位移
  const normalized = ((value - center) / range) * 2 // -1 .. +1
  const clamped = Math.max(-1, Math.min(1, normalized))
  const widthPct = Math.abs(clamped) * 50
  const offsetPct = clamped >= 0 ? 50 : 50 - widthPct
  const color = colors.joints[index]

  return (
    <View>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'baseline'
        }}
      >
        <Text style={{ color: colors.mutedForeground, fontSize: 11, fontWeight: '600' }}>
          J{index + 1}
        </Text>
        <Text style={{ color: colors.foreground, fontSize: 14, fontFamily: 'System' }}>
          {value >= 0 ? '+' : ''}
          {value.toFixed(1)}
          <Text style={{ color: colors.mutedForeground, fontSize: 11 }}>
            {' '}
            {unit}
          </Text>
        </Text>
      </View>
      <View
        style={{
          marginTop: 6,
          height: 8,
          borderRadius: 4,
          backgroundColor: colors.muted,
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        {/* 中线 */}
        <View
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: '50%',
            width: 1,
            backgroundColor: colors.border
          }}
        />
        {/* 数据填充 */}
        <View
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: `${offsetPct}%`,
            width: `${widthPct}%`,
            backgroundColor: color
          }}
        />
      </View>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginTop: 4
        }}
      >
        <Text style={{ color: colors.mutedForeground, fontSize: 9 }}>{min}°</Text>
        <Text style={{ color: colors.mutedForeground, fontSize: 9 }}>0°</Text>
        <Text style={{ color: colors.mutedForeground, fontSize: 9 }}>{max}°</Text>
      </View>
    </View>
  )
}
