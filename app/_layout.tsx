import { useEffect } from 'react'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { useRobotStore } from '@/lib/store'
import '../global.css'

export default function RootLayout() {
  const activeId = useRobotStore((s) => s.activeId)
  const connect = useRobotStore((s) => s.connect)

  // 启动时自动连接上次的机械臂（或进入 mock）
  useEffect(() => {
    connect(activeId)
  }, [])
  // eslint-disable-next-line react-hooks/exhaustive-deps

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#0d1117' }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: '#0d1117' },
            headerTintColor: '#e6edf3',
            contentStyle: { backgroundColor: '#0d1117' }
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="connect"
            options={{ title: '连接机械臂', presentation: 'modal' }}
          />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
