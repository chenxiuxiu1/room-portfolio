/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#07080c',
        ink2: '#0b0d13',
        paper: '#e9e5dd',
        ember: '#ff8a5b',
        mint: '#6ee7d7',
        ash: '#8b8e99',
      },
      fontFamily: {
        // 拉丁字形自托管，中文全部走系统字体，不下载任何中文字体文件
        sans: [
          'Space Grotesk',
          'HarmonyOS Sans SC',
          'MiSans',
          'PingFang SC',
          'Hiragino Sans GB',
          'Microsoft YaHei',
          'system-ui',
          'sans-serif',
        ],
        mono: ['JetBrains Mono', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
      },
      fontSize: {
        // 小字可读性下限：低于 10px 的仅留给纯装饰
        micro: ['10px', { lineHeight: '1.4', letterSpacing: '0.18em' }],
      },
      letterSpacing: {
        ultra: '0.38em',
      },
      transitionTimingFunction: {
        expo: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
}
