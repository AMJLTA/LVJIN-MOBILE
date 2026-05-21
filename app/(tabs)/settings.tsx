import { router } from 'expo-router'
import { Linking, Pressable, ScrollView, Text, View } from 'react-native'
import {
  ChevronRight,
  Cpu,
  ExternalLink,
  Github,
  Info,
  Mail,
  Plus,
  Trash2,
  Zap
} from 'lucide-react-native'
import * as Haptics from 'expo-haptics'
import { useRobotStore } from '@/lib/store'
import { colors } from '@/lib/theme'

export default function SettingsScreen() {
  const saved = useRobotStore((s) => s.saved)
  const activeId = useRobotStore((s) => s.activeId)
  const connect = useRobotStore((s) => s.connect)
  const removeRobot = useRobotStore((s) => s.removeRobot)

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{ padding: 16, gap: 20, paddingBottom: 80 }}
    >
      <View>
        <Text style={{ color: colors.foreground, fontSize: 24, fontWeight: '700' }}>
          设置
        </Text>
        <Text style={{ color: colors.mutedForeground, fontSize: 12, marginTop: 2 }}>
          管理设备 · 网络 · 关于
        </Text>
      </View>

      {/* Devices */}
      <Section title="我的机械臂">
        <DeviceRow
          name="模拟设备 (Mock)"
          url="本地 30 Hz 仿真"
          active={activeId === null}
          onConnect={() => connect(null)}
        />
        {saved.map((r) => (
          <DeviceRow
            key={r.id}
            name={r.name}
            url={r.url}
            active={activeId === r.id}
            onConnect={() => connect(r.id)}
            onDelete={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
              removeRobot(r.id)
            }}
          />
        ))}
        <Pressable
          onPress={() => router.push('/connect')}
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            paddingVertical: 14,
            borderRadius: 12,
            borderWidth: 1,
            borderStyle: 'dashed',
            borderColor: colors.border,
            backgroundColor: pressed ? colors.muted : 'transparent'
          })}
        >
          <Plus color={colors.primary} size={16} />
          <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '600' }}>
            添加机械臂
          </Text>
        </Pressable>
      </Section>

      <Section title="商业">
        <Row
          icon={<Mail color={colors.primary} size={18} />}
          label="联系销售 / 获取报价"
          hint="sales@greenjin.tech"
          onPress={() => Linking.openURL('mailto:sales@greenjin.tech?subject=SO101%20询价')}
        />
        <Row
          icon={<ExternalLink color={colors.foreground} size={18} />}
          label="访问官网"
          hint="so101.greenjin.tech"
          onPress={() => Linking.openURL('https://so101.greenjin.tech')}
        />
        <Row
          icon={<Github color={colors.foreground} size={18} />}
          label="GitHub 仓库"
          hint="开源代码 · issues · PR"
          onPress={() => Linking.openURL('https://github.com/AMJLTA/so101-guide-web')}
        />
      </Section>

      <Section title="关于">
        <Row
          icon={<Info color={colors.foreground} size={18} />}
          label="应用版本"
          hint="0.1.0 (MVP)"
        />
        <Row
          icon={<Cpu color={colors.foreground} size={18} />}
          label="支持的协议"
          hint="WebSocket / 计划支持 BLE / USB"
        />
        <Row
          icon={<Zap color={colors.foreground} size={18} />}
          label="兼容固件"
          hint="LeRobot + greenjin-bridge"
        />
      </Section>

      <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
        <Text style={{ color: colors.mutedForeground, fontSize: 11, textAlign: 'center' }}>
          © {new Date().getFullYear()} 绿晋科技 · LVJIN ROBOTICS
        </Text>
      </View>
    </ScrollView>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: 8 }}>
      <Text
        style={{
          color: colors.mutedForeground,
          fontSize: 11,
          fontWeight: '600',
          letterSpacing: 1.5,
          marginLeft: 4
        }}
      >
        {title.toUpperCase()}
      </Text>
      <View
        style={{
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderWidth: 1,
          borderRadius: 16,
          padding: 10,
          gap: 6
        }}
      >
        {children}
      </View>
    </View>
  )
}

function DeviceRow({
  name,
  url,
  active,
  onConnect,
  onDelete
}: {
  name: string
  url: string
  active: boolean
  onConnect: () => void
  onDelete?: () => void
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingHorizontal: 10,
        paddingVertical: 10,
        borderRadius: 10,
        backgroundColor: active ? `${colors.primary}22` : colors.muted,
        borderColor: active ? colors.primary : colors.border,
        borderWidth: 1
      }}
    >
      <View
        style={{
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: active ? colors.success : colors.mutedForeground
        }}
      />
      <View style={{ flex: 1 }}>
        <Text style={{ color: colors.foreground, fontSize: 14, fontWeight: '600' }}>
          {name}
        </Text>
        <Text
          style={{ color: colors.mutedForeground, fontSize: 11, marginTop: 1 }}
          numberOfLines={1}
        >
          {url}
        </Text>
      </View>
      {!active && (
        <Pressable
          onPress={onConnect}
          style={({ pressed }) => ({
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 6,
            backgroundColor: pressed ? colors.primarySoft : colors.primary
          })}
        >
          <Text style={{ color: 'white', fontSize: 11, fontWeight: '700' }}>
            连接
          </Text>
        </Pressable>
      )}
      {active && (
        <Text style={{ color: colors.success, fontSize: 11, fontWeight: '700' }}>
          已连接
        </Text>
      )}
      {onDelete && (
        <Pressable onPress={onDelete} hitSlop={8}>
          <Trash2 color={colors.mutedForeground} size={16} />
        </Pressable>
      )}
    </View>
  )
}

function Row({
  icon,
  label,
  hint,
  onPress
}: {
  icon: React.ReactNode
  label: string
  hint?: string
  onPress?: () => void
}) {
  const content = (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: 8,
        paddingVertical: 10
      }}
    >
      {icon}
      <View style={{ flex: 1 }}>
        <Text style={{ color: colors.foreground, fontSize: 14 }}>{label}</Text>
        {hint && (
          <Text style={{ color: colors.mutedForeground, fontSize: 11, marginTop: 2 }}>
            {hint}
          </Text>
        )}
      </View>
      {onPress && <ChevronRight color={colors.mutedForeground} size={16} />}
    </View>
  )
  if (onPress) {
    return (
      <Pressable onPress={onPress}>
        {({ pressed }) => (
          <View style={{ opacity: pressed ? 0.6 : 1 }}>{content}</View>
        )}
      </Pressable>
    )
  }
  return content
}
