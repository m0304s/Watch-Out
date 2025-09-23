import { App as CapApp } from '@capacitor/app'
import { Capacitor } from '@capacitor/core'

import { onWatchRefresh } from '@/utils/native/wear'

type AsyncVoid = () => Promise<void> | void

const COOLDOWN_MS = 10_000
let wired = false
let lastSync = 0
let pending: Promise<void> | null = null

export function initWatchSync(opts: { sync: AsyncVoid }): () => void {
  if (
    !Capacitor.isNativePlatform?.() ||
    Capacitor.getPlatform() !== 'android'
  ) {
    return () => {}
  }
  if (wired) return () => {}
  wired = true

  const doSync = async () => {
    const now = Date.now()
    if (now - lastSync < COOLDOWN_MS) return pending ?? undefined
    if (pending) return pending
    pending = (async () => {
      try {
        await opts.sync()
      } finally {
        lastSync = Date.now()
        pending = null
      }
    })()
    return pending
  }

  const disposers: Array<() => void> = []

  void doSync()

  CapApp.addListener('appStateChange', ({ isActive }) => {
    if (isActive) void doSync()
  }).then((h) =>
    disposers.push(() => {
      try {
        h.remove()
      } catch {}
    }),
  )

  onWatchRefresh(() => {
    void doSync()
  })
    .then((off) => disposers.push(off))
    .catch(() => {})

  return () => disposers.forEach((d) => d())
}
