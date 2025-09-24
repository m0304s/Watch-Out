import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { copyFileSync } from 'node:fs'

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
        rewrite: () => '/public/firebase-messaging-sw.js',
      },
    },
  },
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 1000, // 청크 크기 경고 임계값을 1MB로 증가
    rollupOptions: {
      output: {
        // Service Worker 파일을 루트에 복사
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'firebase-messaging-sw.js') {
            return 'firebase-messaging-sw.js'
          }
          return 'assets/[name]-[hash][extname]'
        },
        // 수동 청크 분할로 번들 크기 최적화
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@emotion/react', 'react-icons'],
          'chart-vendor': ['highcharts', 'highcharts-react-official'],
          'utils-vendor': ['axios', 'zustand', 'react-toastify'],
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
