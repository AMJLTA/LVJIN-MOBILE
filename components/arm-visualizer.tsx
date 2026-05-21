import { View } from 'react-native'
import Svg, { Circle, Defs, G, Line, LinearGradient, Path, Stop } from 'react-native-svg'
import { useRobotStore } from '@/lib/store'
import { colors } from '@/lib/theme'

/**
 * 简化的 2D 侧视图机械臂示意
 * 用 J1（底座）+ J2 (大臂俯仰) + J3 (小臂俯仰) 3 个主要关节来画 2D 投影
 */
export function ArmVisualizer({ size = 220 }: { size?: number }) {
  const joints = useRobotStore((s) => s.state.joints)
  const estop = useRobotStore((s) => s.state.estop)

  const w = size
  const h = size

  // 基座位置
  const baseX = w / 2
  const baseY = h - 30

  // 大臂长度
  const L1 = size * 0.32
  const L2 = size * 0.27
  const L3 = size * 0.18 // 末端腕部

  // 关节弧度
  const a2 = ((joints[1] - 90) * Math.PI) / 180 // J2 与垂直方向夹角
  const a3 = a2 + ((joints[2] - 180) * Math.PI) / 180
  const a4 = a3 + ((joints[4] - 90) * Math.PI) / 180

  // 三段端点
  const j2x = baseX + L1 * Math.sin(a2 + Math.PI / 2)
  const j2y = baseY - L1 * Math.cos(a2 + Math.PI / 2)
  const j3x = j2x + L2 * Math.sin(a3 + Math.PI / 2)
  const j3y = j2y - L2 * Math.cos(a3 + Math.PI / 2)
  const j4x = j3x + L3 * Math.sin(a4 + Math.PI / 2)
  const j4y = j3y - L3 * Math.cos(a4 + Math.PI / 2)

  const armColor = estop ? colors.destructive : colors.primary
  const accentColor = estop ? '#ff8a80' : colors.accent

  return (
    <View
      style={{
        backgroundColor: colors.card,
        borderColor: colors.border,
        borderWidth: 1,
        borderRadius: 16,
        padding: 8,
        alignSelf: 'center'
      }}
    >
      <Svg width={w} height={h}>
        <Defs>
          <LinearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={armColor} stopOpacity="0.06" />
            <Stop offset="1" stopColor={armColor} stopOpacity="0.18" />
          </LinearGradient>
          <LinearGradient id="arm" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor={armColor} />
            <Stop offset="1" stopColor={accentColor} />
          </LinearGradient>
        </Defs>

        {/* 网格 */}
        {Array.from({ length: 6 }).map((_, i) => (
          <Line
            key={`gh-${i}`}
            x1={0}
            y1={(h / 6) * i}
            x2={w}
            y2={(h / 6) * i}
            stroke={colors.border}
            strokeOpacity={0.3}
            strokeWidth={1}
          />
        ))}
        {Array.from({ length: 6 }).map((_, i) => (
          <Line
            key={`gv-${i}`}
            x1={(w / 6) * i}
            y1={0}
            x2={(w / 6) * i}
            y2={h}
            stroke={colors.border}
            strokeOpacity={0.3}
            strokeWidth={1}
          />
        ))}

        {/* 地面 */}
        <Path
          d={`M 0 ${baseY + 10} L ${w} ${baseY + 10}`}
          stroke={colors.border}
          strokeWidth={2}
        />
        <Path
          d={`M ${baseX - 30} ${baseY + 5} h 60 v 8 h -60 z`}
          fill={colors.muted}
          stroke={colors.border}
        />

        {/* 大臂 */}
        <G>
          <Line
            x1={baseX}
            y1={baseY - 5}
            x2={j2x}
            y2={j2y}
            stroke="url(#arm)"
            strokeWidth={10}
            strokeLinecap="round"
          />
          <Line
            x1={j2x}
            y1={j2y}
            x2={j3x}
            y2={j3y}
            stroke="url(#arm)"
            strokeWidth={8}
            strokeLinecap="round"
          />
          <Line
            x1={j3x}
            y1={j3y}
            x2={j4x}
            y2={j4y}
            stroke="url(#arm)"
            strokeWidth={6}
            strokeLinecap="round"
          />
        </G>

        {/* 关节 */}
        <Circle cx={baseX} cy={baseY - 5} r={6} fill={colors.joints[0]} />
        <Circle cx={j2x} cy={j2y} r={5} fill={colors.joints[1]} />
        <Circle cx={j3x} cy={j3y} r={4} fill={colors.joints[2]} />
        <Circle cx={j4x} cy={j4y} r={6} fill={accentColor} stroke="white" strokeWidth={1.5} />
      </Svg>
    </View>
  )
}
