import { ref, watch } from 'vue'

const STORAGE_KEY = 'side-order-v1'
const caLeft = ref(true)

try {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (raw === 'false') caLeft.value = false
} catch {}

watch(caLeft, v => {
  try { localStorage.setItem(STORAGE_KEY, String(v)) } catch {}
})

export function useSideOrder() {
  const toggle = () => { caLeft.value = !caLeft.value }
  return { caLeft, toggle }
}
