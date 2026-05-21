import { useState } from 'react'
import { router } from 'expo-router'
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native'
import * as Haptics from 'expo-haptics'
import { Cpu, Cable, Plus, Wifi } from 'lucide-react-native'
import { useRobotStore } from '@/lib/store'
import { colors } from '@/lib/theme'

export default function ConnectScreen() {
  const addRobot = useRobotStore((s) => s.addRobot)
  const connect = useRobotStore((s) => s.connect)
  const [name, setName] = useState('实验台 SO101')
  const [url, setUrl] = useState('ws://192.168.1.100:8765')

  const handleAdd = () => {
    if (!name.trim() || !url.trim()) {
      Alert.alert('请填写名称和地址')
      return
    }
    if (!/^wss?:\/\//.test(url.trim())) {
      Alert.alert('地址必须以 ws:// 或 wss:// 开头')
      return
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    addRobot({ name: name.trim(), url: url.trim() })
    setTimeout(() => {
      // 连接刚加的一个
      const saved = useRobotStore.getState().saved
      const last = saved[saved.length - 1]
      if (last) connect(last.id)
    }, 100)
    router.back()
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{ padding: 16, gap: 16 }}
      keyboardShouldPersistTaps="handled"
    >
      <View
        style={{
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderWidth: 1,
          borderRadius: 16,
          padding: 16
        }}
      >
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', marginBottom: 12 }}>
          <Wifi color={colors.primary} size={18} />
          <Text style={{ color: colors.foreground, fontSize: 16, fontWeight: '600' }}>
            手动添加（Wi-Fi）
          </Text>
        </View>
        <Text style={{ color: colors.mutedForeground, fontSize: 12, marginBottom: 16, lineHeight: 18 }}>
          在 PC 端跑 greenjin-bridge 后会在终端打印一个 WebSocket 地址，把它填到下面。
          建议手机和 PC 在同一局域网。
        </Text>

        <Field
          label="设备名称"
          value={name}
          onChangeText={setName}
          placeholder="例如 实验台 SO101"
        />
        <Field
          label="WebSocket 地址"
          value={url}
          onChangeText={setUrl}
          placeholder="ws://192.168.x.x:8765"
          autoCapitalize="none"
          keyboardType="url"
        />

        <Pressable
          onPress={handleAdd}
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            backgroundColor: pressed ? colors.primarySoft : colors.primary,
            paddingVertical: 14,
            borderRadius: 12,
            marginTop: 12
          })}
        >
          <Plus color="white" size={16} />
          <Text style={{ color: 'white', fontSize: 14, fontWeight: '700' }}>
            保存并连接
          </Text>
        </Pressable>
      </View>

      <View
        style={{
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderWidth: 1,
          borderRadius: 16,
          padding: 16,
          gap: 8
        }}
      >
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', marginBottom: 4 }}>
          <Cable color={colors.mutedForeground} size={16} />
          <Text style={{ color: colors.mutedForeground, fontSize: 13, fontWeight: '600' }}>
            其他连接方式（开发中）
          </Text>
        </View>
        <Bullet text="蓝牙 BLE — 适合无网络场景，需对接 react-native-ble-plx" />
        <Bullet text="USB OTG — 仅 Android，直连机械臂控制板" />
        <Bullet text="云端中继 — 适合远程多设备管理" />
      </View>

      <Pressable
        onPress={() => router.back()}
        style={({ pressed }) => ({
          alignItems: 'center',
          paddingVertical: 12,
          opacity: pressed ? 0.6 : 1
        })}
      >
        <Text style={{ color: colors.mutedForeground, fontSize: 13 }}>取消</Text>
      </Pressable>
    </ScrollView>
  )
}

function Field({
  label,
  ...inputProps
}: { label: string } & React.ComponentProps<typeof TextInput>) {
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={{ color: colors.mutedForeground, fontSize: 11, fontWeight: '600', letterSpacing: 1, marginBottom: 6 }}>
        {label.toUpperCase()}
      </Text>
      <TextInput
        {...inputProps}
        placeholderTextColor={colors.mutedForeground}
        style={{
          color: colors.foreground,
          fontSize: 14,
          backgroundColor: colors.muted,
          borderColor: colors.border,
          borderWidth: 1,
          borderRadius: 10,
          paddingHorizontal: 12,
          paddingVertical: 10
        }}
      />
    </View>
  )
}

function Bullet({ text }: { text: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
      <Cpu color={colors.mutedForeground} size={12} style={{ marginTop: 3 }} />
      <Text style={{ color: colors.mutedForeground, fontSize: 12, flex: 1, lineHeight: 18 }}>
        {text}
      </Text>
    </View>
  )
}
