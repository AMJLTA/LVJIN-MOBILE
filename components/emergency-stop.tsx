import { Pressable, Text, View } from 'react-native'
import * as Haptics from 'expo-haptics'
import { OctagonAlert } from 'lucide-react-native'
import { useRobotStore } from '@/lib/store'
import { colors } from '@/lib/theme'

interface EmergencyStopProps {
  size?: number
}

export function EmergencyStop({ size = 96 }: EmergencyStopProps) {
  const estop = useRobotStore((s) => s.state.estop)
  const setEstop = useRobotStore((s) => s.setEstop)

  const handlePress = () => {
    Haptics.notificationAsync(
      estop ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Warning
    )
    setEstop(!estop)
  }

  return (
    <View style={{ alignItems: 'center', gap: 8 }}>
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => ({
          width: size,
          height: size,
          borderRadius: size / 2,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: estop ? colors.success : colors.destructive,
          opacity: pressed ? 0.85 : 1,
          shadowColor: estop ? colors.success : colors.destructive,
          shadowOpacity: 0.6,
          shadowRadius: 24,
          elevation: 16,
          borderWidth: 4,
          borderColor: '#ffffff15'
        })}
      >
        <OctagonAlert color="white" size={size * 0.4} />
      </Pressable>
      <Text
        style={{
          color: estop ? colors.success : colors.destructive,
          fontSize: 13,
          fontWeight: '700',
          letterSpacing: 2
        }}
      >
        {estop ? '解除急停' : '紧急停止'}
      </Text>
    </View>
  )
}
