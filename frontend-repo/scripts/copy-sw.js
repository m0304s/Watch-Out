#!/usr/bin/env node

/**
 * Service Worker 파일을 루트로 복사하는 스크립트
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const sourceFile = path.join(__dirname, '../public/firebase-messaging-sw.js')
const targetFile = path.join(__dirname, '../dist/firebase-messaging-sw.js')

// dist 디렉토리가 없으면 생성
const distDir = path.dirname(targetFile)
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true })
}

try {
  // Service Worker 파일 복사
  fs.copyFileSync(sourceFile, targetFile)
  console.log('✅ Service Worker 파일이 루트로 복사되었습니다')
  console.log(`📁 복사 위치: ${targetFile}`)
} catch (error) {
  console.error('❌ Service Worker 파일 복사 실패:', error)
  process.exit(1)
}
