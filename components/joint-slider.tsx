import { useRef } from 'react'
import { View, Text } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { colors } from '@/lib/theme'

interface JointSliderProps {
  index: number
  value: number
  min: number
  max: number
  onChange: (v: number) => void
}

/**
 * 关节滑动条 —— 水平拖动，实时回调
 * 使用 Reanimated 在 UI 线程跑滑动逻辑，再通过 runOnJS 回 JS 线程发命令
 */
export function JointSlider({ index, value, min, max, onChange }: JointSliderProps) {
  const trackWidth = useSharedValue(0)
  const offset = useSharedValue(((value - min) / (max - min)) * 100)
  const startOffset = useRef(0)
  const lastHaptic = useRef(0)

  // 当外部 value 变化时同步（避免 ping-pong：只在差值大时同步）
  const externalSync = (((value - min) / (max - min)) * 100)
  if (Math.abs(offset.value - externalSync) > 8) {
    offset.value = externalSync
  }

  const onValueChange = (pct: number) => {
    const v = min + (pct / 100) * (max - min)
    onChange(Number(v.toFixed(1)))
    const now = Date.now()
    if (now - lastHaptic.current > 60) {
      Haptics.selectionAsync()
      lastHaptic.current = now
    }
  }

  const pan = Gesture.Pan()
    .onBegin(() => {
      startOffset.current = offset.value
    })
    .onUpdate((e) => {
      const w = trackWidth.value || 1
      const delta = (e.translationX / w) * 100
      const next = Math.max(0, Math.min(100, startOffset.current + delta))
      offset.value = next
      runOnJS(onValueChange)(next)
    })

  const thumbStyle = useAnimatedStyle(() => ({
    left: `${offset.value}%`
  }))

  const fillStyle = useAnimatedStyle(() => ({
    width: `${offset.value}%`
  }))

  const jointColor = colors.joints[index]

  return (
    <View style={{ paddingVertical: 6 }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: 6
        }}
      >
        <Text style={{ color: colors.foreground, fontSize: 13, fontWeight: '600' }}>
          J{index + 1}
        </Text>
        <Text style={{ color: jointColor, fontSize: 14, fontWeight: '700' }}>
          {value >= 0 ? '+' : ''}
          {value.toFixed(1)}°
        </Text>
      </View>
      <GestureDetector gesture={pan}>
        <View
          onLayout={(e) => {
            trackWidth.value = e.nativeEvent.layout.width
          }}
          style={{
            height: 36,
            justifyContent: 'center',
            position: 'relative'
          }}
        >
          {/* 轨道 */}
          <View
            style={{
              height: 6,
              borderRadius: 3,
              backgroundColor: colors.muted
            }}
          />
          {/* 填充 */}
          <Animated.View
            style={[
              {
                position: 'absolute',
                left: 0,
                height: 6,
                borderRadius: 3,
                backgroundColor: jointColor
              },
              fillStyle
            ]}
          />
          {/* 滑块 */}
          <Animated.View
            style={[
              {
                position: 'absolute',
                width: 24,
                height: 24,
                marginLeft: -12,
                borderRadius: 12,
                backgroundColor: jointColor,
                shadowColor: jointColor,
                shadowOpacity: 0.6,
                shadowRadius: 8,
                elevation: 8,
                borderWidth: 2,
                borderColor: colors.bg
              },
              thumbStyle
            ]}
          />
        </View>
      </GestureDetector>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginTop: 2
        }}
      >
        <Text style={{ color: colors.mutedForeground, fontSize: 10 }}>{min}°</Text>
        <Text style={{ color: colors.mutedForeground, fontSize: 10 }}>{max}°</Text>
      </View>
    </View>
  )
}
