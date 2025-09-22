import { registerPlugin } from '@capacitor/core'
import type { PluginListenerHandle } from '@capacitor/core'

import { isMobilePlatform } from '@/utils/platform'
import type { MyAreaResponse } from '@/features/area/types/area'

interface WearBridgePlugin {
  sendAreaInfo(options: { json: string }): Promise<{ ok: boolean }>
  addListener(
    eventName: 'watchRefresh',
    listenerFunc: () => void,
  ): Promise<PluginListenerHandle>
}

const WearBridge = registerPlugin<WearBridgePlugin>('WearBridge')

export async function pushAreaInfoToWatch(payload: MyAreaResponse) {
  if (!isMobilePlatform()) return // 웹에서는 아무 것도 하지 않음
  try {
    const json = JSON.stringify(payload)
    await WearBridge.sendAreaInfo({ json })
  } catch (e: any) {
    const msg = e?.message || e?.toString?.() || JSON.stringify(e)
  }
}

export async function onWatchRefresh(handler: () => void): Promise<() => void> {
  if (!isMobilePlatform()) return () => {}
  const sub = await WearBridge.addListener('watchRefresh', handler)
  return () => {
    try {
      sub.remove()
    } catch {}
  }
}
