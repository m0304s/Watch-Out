import { areaAPI } from '@/features/area/services/area'
import { pushAreaInfoToWatch } from '@/utils/native/wear'

export async function syncMyAreaToWatch() {
  const payload = await areaAPI.getMyArea()
  await pushAreaInfoToWatch(payload)
}
