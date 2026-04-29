import { ref, watch, onBeforeUnmount } from 'vue'

const HIDDEN_THRESHOLD_MS = 60_000
const resetSignal = ref(0)
let lastHiddenAt = null

if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      lastHiddenAt = Date.now()
    } else if (document.visibilityState === 'visible') {
      if (lastHiddenAt !== null && Date.now() - lastHiddenAt >= HIDDEN_THRESHOLD_MS) {
        resetSignal.value++
      }
      lastHiddenAt = null
    }
  })
}

export function onResume(handler) {
  const stop = watch(resetSignal, () => handler())
  onBeforeUnmount(stop)
}
