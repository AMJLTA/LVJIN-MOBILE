import { useEffect, useRef, useState } from 'react'
import { Pressable, Text, TextInput, View } from 'react-native'
import * as Haptics from 'expo-haptics'
import { Camera, Circle, Square, Video as VideoIcon } from 'lucide-react-native'
import { ConnectionStatus } from '@/components/connection-status'
import { useRobotStore } from '@/lib/store'
import { colors } from '@/lib/theme'

export default function RecordScreen() {
  const recordingEpisode = useRobotStore((s) => s.recordingEpisode)
  const startRecord = useRobotStore((s) => s.startRecord)
  const stopRecord = useRobotStore((s) => s.stopRecord)
  const state = useRobotStore((s) => s.state)
  const [name, setName] = useState('pick_place')
  const [elapsed, setElapsed] = useState(0)
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (recordingEpisode) {
      timer.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - recordingEpisode.startedAt) / 1000))
      }, 200)
    } else {
      setElapsed(0)
      if (timer.current) clearInterval(timer.current)
    }
    return () => {
      if (timer.current) clearInterval(timer.current)
    }
  }, [recordingEpisode])

  const isRecording = !!recordingEpisode

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.bg,
        padding: 16,
        gap: 16
      }}
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
            数据采集
          </Text>
          <Text style={{ color: colors.mutedForeground, fontSize: 12, marginTop: 2 }}>
            手动遥操作 · 关节状态自动同步录制
          </Text>
        </View>
        <ConnectionStatus compact />
      </View>

      {/* Camera placeholder */}
      <View
        style={{
          aspectRatio: 4 / 3,
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderWidth: 1,
          borderRadius: 16,
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        <Camera color={colors.mutedForeground} size={48} />
        <Text style={{ color: colors.mutedForeground, fontSize: 12, marginTop: 8 }}>
          外部相机预览位 · 接入 expo-camera 后启用
        </Text>
        {isRecording && (
          <View
            style={{
              position: 'absolute',
              top: 12,
              right: 12,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              backgroundColor: '#dc262611',
              borderColor: colors.destructive,
              borderWidth: 1,
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 999
            }}
          >
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: colors.destructive
              }}
            />
            <Text style={{ color: colors.destructive, fontSize: 11, fontWeight: '700' }}>
              REC · {elapsed}s
            </Text>
          </View>
        )}
      </View>

      {/* Name input */}
      <View
        style={{
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderWidth: 1,
          borderRadius: 12,
          paddingHorizontal: 14,
          paddingVertical: 4
        }}
      >
        <Text style={{ color: colors.mutedForeground, fontSize: 10, fontWeight: '600', letterSpacing: 1, marginTop: 6 }}>
          EPISODE 名称
        </Text>
        <TextInput
          value={name}
          onChangeText={setName}
          editable={!isRecording}
          autoCapitalize="none"
          placeholder="例如 pick_place_001"
          placeholderTextColor={colors.mutedForeground}
          style={{
            color: colors.foreground,
            fontSize: 16,
            paddingVertical: 8,
            fontFamily: 'System'
          }}
        />
      </View>

      {/* Big REC button */}
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
          if (isRecording) {
            stopRecord()
          } else {
            startRecord(name || 'untitled')
          }
        }}
        style={({ pressed }) => ({
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          paddingVertical: 20,
          borderRadius: 16,
          backgroundColor: isRecording ? colors.destructive : colors.primary,
          opacity: pressed ? 0.85 : 1,
          shadowColor: isRecording ? colors.destructive : colors.primary,
          shadowOpacity: 0.4,
          shadowRadius: 16,
          elevation: 8
        })}
      >
        {isRecording ? (
          <Square color="white" size={20} fill="white" />
        ) : (
          <Circle color="white" size={20} fill="white" />
        )}
        <Text style={{ color: 'white', fontSize: 16, fontWeight: '700', letterSpacing: 1 }}>
          {isRecording ? '停止采集' : '开始采集'}
        </Text>
      </Pressable>

      {/* Live joint pulse */}
      <View
        style={{
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderWidth: 1,
          borderRadius: 16,
          padding: 16
        }}
      >
        <View style={{ flexDirection: 'row', gap: 6, marginBottom: 10, alignItems: 'center' }}>
          <VideoIcon color={colors.primary} size={14} />
          <Text style={{ color: colors.mutedForeground, fontSize: 11, fontWeight: '600', letterSpacing: 1.5 }}>
            LIVE TELEMETRY
          </Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {state.joints.map((j, i) => {
            const bump = Math.abs(j) % 50
            return (
              <View
                key={i}
                style={{
                  flex: 1,
                  height: 56,
                  borderRadius: 8,
                  backgroundColor: colors.muted,
                  position: 'relative',
                  overflow: 'hidden',
                  justifyContent: 'flex-end'
                }}
              >
                <View
                  style={{
                    height: `${Math.min(95, 5 + bump)}%`,
                    backgroundColor: colors.joints[i],
                    opacity: 0.7
                  }}
                />
                <Text
                  style={{
                    position: 'absolute',
                    bottom: 4,
                    left: 0,
                    right: 0,
                    color: colors.foreground,
                    fontSize: 9,
                    textAlign: 'center',
                    fontWeight: '700'
                  }}
                >
                  J{i + 1}
                </Text>
              </View>
            )
          })}
        </View>
      </View>
    </View>
  )
}
