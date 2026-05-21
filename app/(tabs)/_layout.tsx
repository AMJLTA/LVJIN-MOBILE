import { Tabs } from 'expo-router'
import {
  Activity,
  Gamepad2,
  Settings,
  Video
} from 'lucide-react-native'
import { colors } from '@/lib/theme'

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.bg },
        headerTitleStyle: { color: colors.foreground, fontWeight: '600' },
        headerTintColor: colors.foreground,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '500' }
      }}
    >
      <Tabs.Screen
        name="monitor"
        options={{
          title: '监控',
          tabBarIcon: ({ color }) => <Activity color={color} size={22} />
        }}
      />
      <Tabs.Screen
        name="control"
        options={{
          title: '遥控',
          tabBarIcon: ({ color }) => <Gamepad2 color={color} size={22} />
        }}
      />
      <Tabs.Screen
        name="record"
        options={{
          title: '采集',
          tabBarIcon: ({ color }) => <Video color={color} size={22} />
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: '设置',
          tabBarIcon: ({ color }) => <Settings color={color} size={22} />
        }}
      />
    </Tabs>
  )
}
