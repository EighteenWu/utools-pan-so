import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 说明：Vite 会自动将 `public/` 目录拷贝到 `dist/`，
// 包括 `public/plugin.json`、`public/preload.js`、`public/logo.png` 等。
// 无需自定义复制插件，避免路径错误与重复拷贝。

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  }
})

