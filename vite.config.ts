import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
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
})
