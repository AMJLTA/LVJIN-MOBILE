import { useState } from 'react'
import { Pressable, ScrollView, Text, View } from 'react-native'
import * as Haptics from 'expo-haptics'
import { Hand, Home, Sparkles } from 'lucide-react-native'
import { ConnectionStatus } from '@/components/connection-status'
import { EmergencyStop } from '@/components/emergency-stop'
import { JointSlider } from '@/components/joint-slider'
import { useRobotStore } from '@/lib/store'
import { colors, JOINT_LIMITS } from '@/lib/theme'

export default function ControlScreen() {
  const state = useRobotStore((s) => s.state)
  const jogJoints = useRobotStore((s) => s.jogJoints)
  const setGravComp = useRobotStore((s) => s.setGravComp)
  const homePosition = useRobotStore((s) => s.homePosition)
  const [target, setTarget] = useState<number[]>(state.joints.slice())

  const updateJoint = (idx: number, v: number) => {
    const next = [...target]
    next[idx] = v
    setTarget(next)
    jogJoints(next)
  }

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
            遥控操作
          </Text>
          <Text style={{ color: colors.mutedForeground, fontSize: 12, marginTop: 2 }}>
            滑动单个关节 · 命令立即下发
          </Text>
        </View>
        <ConnectionStatus compact />
      </View>

      {/* E-stop + actions */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderWidth: 1,
          borderRadius: 16,
          padding: 16,
          gap: 12
        }}
      >
        <EmergencyStop size={88} />
        <View style={{ flex: 1, gap: 8 }}>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
              setGravComp(!state.gravComp)
            }}
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 14,
              paddingVertical: 12,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: state.gravComp ? colors.primary : colors.border,
              backgroundColor: state.gravComp ? `${colors.primary}22` : colors.muted,
              opacity: pressed ? 0.7 : 1
            })}
          >
            <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
              <Hand color={state.gravComp ? colors.primary : colors.mutedForeground} size={16} />
              <Text style={{ color: colors.foreground, fontSize: 13, fontWeight: '600' }}>
                重力补偿
              </Text>
            </View>
            <Text style={{ color: state.gravComp ? colors.primary : colors.mutedForeground, fontSize: 11 }}>
              {state.gravComp ? '已开启' : '已关闭'}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
              homePosition()
              setTarget([0, -30, 60, 0, 30, 0])
            }}
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              paddingHorizontal: 14,
              paddingVertical: 12,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.muted,
              opacity: pressed ? 0.7 : 1
            })}
          >
            <Home color={colors.foreground} size={16} />
            <Text style={{ color: colors.foreground, fontSize: 13, fontWeight: '600' }}>
              回零位
            </Text>
          </Pressable>

          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
              const random = JOINT_LIMITS.map(([min, max]) => {
                return min + Math.random() * (max - min) * 0.6 + (max - min) * 0.2
              })
              setTarget(random)
              jogJoints(random)
            }}
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              paddingHorizontal: 14,
              paddingVertical: 12,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.muted,
              opacity: pressed ? 0.7 : 1
            })}
          >
            <Sparkles color={colors.accent} size={16} />
            <Text style={{ color: colors.foreground, fontSize: 13, fontWeight: '600' }}>
              随机姿态
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Joint sliders */}
      <View
        style={{
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderWidth: 1,
          borderRadius: 16,
          padding: 16,
          gap: 10
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 4
          }}
        >
          <Text
            style={{
              color: colors.mutedForeground,
              fontSize: 11,
              fontWeight: '600',
              letterSpacing: 1.5
            }}
          >
            JOINT CONTROL
          </Text>
          <Text style={{ color: colors.mutedForeground, fontSize: 11 }}>
            实时下发 · 急停时不响应
          </Text>
        </View>
        {target.map((v, i) => (
          <JointSlider
            key={i}
            index={i}
            value={v}
            min={JOINT_LIMITS[i][0]}
            max={JOINT_LIMITS[i][1]}
            onChange={(nv) => updateJoint(i, nv)}
          />
        ))}
      </View>

      {/* Quick presets */}
      <View
        style={{
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderWidth: 1,
          borderRadius: 16,
          padding: 16
        }}
      >
        <Text style={{ color: colors.mutedForeground, fontSize: 11, fontWeight: '600', letterSpacing: 1.5, marginBottom: 10 }}>
          PRESETS
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {[
            { label: '零位', joints: [0, 0, 0, 0, 0, 0] },
            { label: '起始位', joints: [0, -30, 60, 0, 30, 0] },
            { label: '工作位', joints: [0, -60, 90, 0, 60, 0] },
            { label: '抓取位', joints: [45, -80, 100, 0, 70, 0] }
          ].map((p) => (
            <Pressable
              key={p.label}
              onPress={() => {
                Haptics.selectionAsync()
                setTarget(p.joints)
                jogJoints(p.joints)
              }}
              style={({ pressed }) => ({
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 999,
                backgroundColor: colors.muted,
                borderColor: colors.border,
                borderWidth: 1,
                opacity: pressed ? 0.7 : 1
              })}
            >
              <Text style={{ color: colors.foreground, fontSize: 12, fontWeight: '500' }}>
                {p.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    </ScrollView>
  )
}
