import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  // 静态站挂在 GitHub Pages 的子路径下（https://<user>.github.io/room-portfolio/），
  // 路径前缀必须写进产物，否则一上线所有 js/css 都是 404。
  // 本地 dev 与 preview 仍旧用根路径，不影响到 5302 上调试。
  base: mode === 'production' ? '/room-portfolio/' : '/',
  server: { port: 5300, host: true },
  build: {
    // three 生态体积固定且很少变动，单独成块利于长期缓存
    chunkSizeWarningLimit: 760,
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three'],
          r3f: [
            '@react-three/fiber',
            '@react-three/drei',
            '@react-three/postprocessing',
            'postprocessing',
          ],
          react: ['react', 'react-dom', 'framer-motion'],
        },
      },
    },
  },
}))
