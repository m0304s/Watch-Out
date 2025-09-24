import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import babel from 'vite-plugin-babel'
import path from 'node:path'
import { copyFileSync } from 'fs'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      jsxImportSource: '@emotion/react',
      babel: {
        plugins: ['@emotion/babel-plugin'],
      },
    }),
    // Service Worker 파일을 루트로 복사하는 플러그인
    {
      name: 'copy-service-worker',
      buildStart() {
        try {
          copyFileSync(
            'public/firebase-messaging-sw.js',
            'dist/firebase-messaging-sw.js',
          )
          console.log('✅ Service Worker 파일이 루트로 복사되었습니다')
        } catch (error) {
          console.warn('⚠️ Service Worker 파일 복사 실패:', error)
        }
      },
      generateBundle() {
        try {
          copyFileSync(
            'public/firebase-messaging-sw.js',
            'dist/firebase-messaging-sw.js',
          )
          console.log('✅ Service Worker 파일이 루트로 복사되었습니다')
        } catch (error) {
          console.warn('⚠️ Service Worker 파일 복사 실패:', error)
        }
      },
    },
  ],
  server: {
    // 개발 서버에서 Service Worker 파일 제공
    fs: {
      allow: ['..'],
    },
    // 개발 서버에서 Service Worker 파일을 루트에 제공
    middlewareMode: false,
    proxy: {
      '/firebase-messaging-sw.js': {
        target: 'http://localhost:5173',
        changeOrigin: true,
        rewrite: (path) => '/public/firebase-messaging-sw.js',
      },
    },
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        // Service Worker 파일을 루트에 복사
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'firebase-messaging-sw.js') {
            return 'firebase-messaging-sw.js'
          }
          return 'assets/[name]-[hash][extname]'
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
