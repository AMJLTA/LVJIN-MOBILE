/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // 沿用网站的 OKLCH 色调（在 RN 里用 hex/rgb 近似）
        bg: '#0d1117',
        card: '#161b22',
        muted: '#21262d',
        border: '#30363d',
        foreground: '#e6edf3',
        'muted-foreground': '#8b949e',
        primary: '#7c5cff',
        'primary-soft': '#3d2d8f',
        accent: '#b45cff',
        success: '#3fb950',
        warning: '#d29922',
        destructive: '#f85149'
      },
      fontFamily: {
        sans: ['System'],
        mono: ['SpaceMono']
      }
    }
  },
  plugins: []
}
