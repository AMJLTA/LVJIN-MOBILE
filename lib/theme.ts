/**
 * RN 主题常量
 * 与 tailwind.config.js 的颜色保持一致
 */

export const colors = {
  bg: '#0d1117',
  card: '#161b22',
  cardSoft: '#1c2128',
  muted: '#21262d',
  border: '#30363d',
  borderSoft: '#3d444e',
  foreground: '#e6edf3',
  mutedForeground: '#8b949e',
  primary: '#7c5cff',
  primarySoft: '#3d2d8f',
  accent: '#b45cff',
  success: '#3fb950',
  warning: '#d29922',
  destructive: '#f85149',
  // 关节专属配色（六轴各一种颜色）
  joints: ['#7c5cff', '#b45cff', '#5cffd6', '#5cff7c', '#ffd95c', '#ff7c5c'] as const
} as const

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32
} as const

export const radius = {
  sm: 6,
  md: 10,
  lg: 16,
  xl: 24,
  pill: 999
} as const

/** 6 自由度关节运动范围（度） */
export const JOINT_LIMITS: [number, number][] = [
  [-180, 180],
  [-130, 130],
  [-150, 150],
  [-180, 180],
  [-120, 120],
  [-360, 360]
]
