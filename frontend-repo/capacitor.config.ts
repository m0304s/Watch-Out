import { defineConfig, loadEnv } from 'vite'
import type { CapacitorConfig } from '@capacitor/cli'

const env = loadEnv(process.env.NODE_ENV || 'development', process.cwd(), '')

const config: CapacitorConfig = {
  appId: 'com.ssafy.watchout',
  appName: 'watch-out',
  webDir: 'dist',
  server: {
    // url: env.VITE_CAPACITOR_SERVER_URL,
    cleartext: true,
  },
}

export default config
