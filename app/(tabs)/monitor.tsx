import { ScrollView, Text, View } from 'react-native'
import { Activity, Thermometer, Move3D, Pause, Play } from 'lucide-react-native'
import { ArmVisualizer } from '@/components/arm-visualizer'
import { ConnectionStatus } from '@/components/connection-status'
import { JointBar } from '@/components/joint-bar'
import { useRobotStore } from '@/lib/store'
import { colors } from '@/lib/theme'

export default function MonitorScreen() {
  const state = useRobotStore((s) => s.state)
  const isMock = useRobotStore((s) => s.isMock)
  const recordingEpisode = useRobotStore((s) => s.recordingEpisode)
  const status = useRobotStore((s) => s.status)

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{ padding: 16, paddingBottom: 80, gap: 16 }}
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <View>
          <Text style={{ color: colors.foreground, fontSize: 24, fontWeight: '700' }}>
            实时监控
          </Text>
          <Text style={{ color: colors.mutedForeground, fontSize: 12, marginTop: 2 }}>
            {isMock ? '模拟数据 · 30 Hz' : '远程设备 · 实时'}
          </Text>
        </View>
        <ConnectionStatus />
      </View>

      {/* Arm visualizer */}
      <View
        style={{
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderWidth: 1,
          borderRadius: 16,
          padding: 16
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 12
          }}
        >
          <Text style={{ color: colors.mutedForeground, fontSize: 11, fontWeight: '600', letterSpacing: 1.5 }}>
            ARM PROFILE
          </Text>
          <View
            style={{
              flexDirection: 'row',
              gap: 8,
              alignItems: 'center'
            }}
          >
            {state.estop ? (
              <>
                <Pause color={colors.destructive} size={12} />
                <Text style={{ color: colors.destructive, fontSize: 11, fontWeight: '600' }}>
                  ESTOP
                </Text>
              </>
            ) : (
              <>
                <Play color={colors.success} size={12} />
                <Text style={{ color: colors.success, fontSize: 11, fontWeight: '600' }}>
                  RUN
                </Text>
              </>
            )}
          </View>
        </View>
        <ArmVisualizer size={220} />
      </View>

      {/* Cartesian pose */}
      <View
        style={{
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderWidth: 1,
          borderRadius: 16,
          padding: 16
        }}
      >
        <View style={{ flexDirection: 'row', gap: 6, marginBottom: 12, alignItems: 'center' }}>
          <Move3D color={colors.accent} size={16} />
          <Text style={{ color: colors.mutedForeground, fontSize: 11, fontWeight: '600', letterSpacing: 1.5 }}>
            END-EFFECTOR POSE
          </Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
          {(['X', 'Y', 'Z'] as const).map((axis, i) => (
            <View key={axis} style={{ flex: 1 }}>
              <Text style={{ color: colors.mutedForeground, fontSize: 11 }}>
                {axis}
              </Text>
              <Text
                style={{
                  color: colors.foreground,
                  fontSize: 18,
                  fontWeight: '700',
                  marginTop: 2
                }}
              >
                {state.pose[i].toFixed(3)}
                <Text style={{ color: colors.mutedForeground, fontSize: 11 }}>
                  {' '}
                  m
                </Text>
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Joints */}
      <View
        style={{
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderWidth: 1,
          borderRadius: 16,
          padding: 16
        }}
      >
        <View style={{ flexDirection: 'row', gap: 6, marginBottom: 16, alignItems: 'center' }}>
          <Activity color={colors.primary} size={16} />
          <Text style={{ color: colors.mutedForeground, fontSize: 11, fontWeight: '600', letterSpacing: 1.5 }}>
            JOINT ANGLES
          </Text>
        </View>
        <View style={{ gap: 14 }}>
          {state.joints.map((v, i) => (
            <JointBar key={i} index={i} value={v} />
          ))}
        </View>
      </View>

      {/* Temps */}
      <View
        style={{
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderWidth: 1,
          borderRadius: 16,
          padding: 16
        }}
      >
        <View style={{ flexDirection: 'row', gap: 6, marginBottom: 12, alignItems: 'center' }}>
          <Thermometer color={colors.warning} size={16} />
          <Text style={{ color: colors.mutedForeground, fontSize: 11, fontWeight: '600', letterSpacing: 1.5 }}>
            MOTOR TEMPERATURE
          </Text>
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {state.temps.map((t, i) => {
            const tooHot = t > 60
            return (
              <View
                key={i}
                style={{
                  flex: 1,
                  minWidth: 80,
                  padding: 10,
                  borderRadius: 10,
                  backgroundColor: colors.muted,
                  borderWidth: 1,
                  borderColor: tooHot ? colors.destructive : colors.border
                }}
              >
                <Text style={{ color: colors.mutedForeground, fontSize: 10 }}>
                  J{i + 1}
                </Text>
                <Text
                  style={{
                    color: tooHot ? colors.destructive : colors.foreground,
                    fontSize: 18,
                    fontWeight: '700',
                    marginTop: 2
                  }}
                >
                  {t.toFixed(1)}
                  <Text style={{ color: colors.mutedForeground, fontSize: 10 }}>
                    {' '}
                    °C
                  </Text>
                </Text>
              </View>
            )
          })}
        </View>
      </View>

      {recordingEpisode && (
        <View
          style={{
            backgroundColor: '#dc262615',
            borderColor: colors.destructive,
            borderWidth: 1,
            borderRadius: 16,
            padding: 16,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12
          }}
        >
          <View
            style={{
              width: 12,
              height: 12,
              borderRadius: 6,
              backgroundColor: colors.destructive
            }}
          />
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.foreground, fontSize: 13, fontWeight: '700' }}>
              正在采集：{recordingEpisode.name}
            </Text>
            <Text style={{ color: colors.mutedForeground, fontSize: 11, marginTop: 2 }}>
              已录制 {Math.floor((Date.now() - recordingEpisode.startedAt) / 1000)} 秒
            </Text>
          </View>
        </View>
      )}

      <Text style={{ color: colors.mutedForeground, fontSize: 10, textAlign: 'center', marginTop: 8 }}>
        服务端时间戳 {new Date(state.ts).toLocaleTimeString()} · 连接 {status}
      </Text>
    </ScrollView>
  )
}
