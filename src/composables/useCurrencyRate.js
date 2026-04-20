import { ref } from 'vue'

const STORAGE_KEY = 'cadusd-rate-v1'
const STALE_AFTER = 12 * 60 * 60 * 1000

// rate = CAD per 1 USD. USD * rate -> CAD, CAD / rate -> USD.
const rate = ref(null)
const asOf = ref(null)        // API date (YYYY-MM-DD), if provided
const fetchedAt = ref(null)   // ms when we last fetched
const loading = ref(false)
const error = ref(null)

try {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (raw) {
    const p = JSON.parse(raw)
    if (typeof p.rate === 'number') rate.value = p.rate
    if (typeof p.asOf === 'string') asOf.value = p.asOf
    if (typeof p.fetchedAt === 'number') fetchedAt.value = p.fetchedAt
  }
} catch {}

async function refresh() {
  if (loading.value) return
  loading.value = true
  error.value = null
  try {
    const res = await fetch('https://api.frankfurter.dev/v1/latest?base=USD&symbols=CAD')
    if (!res.ok) throw new Error('Network error')
    const data = await res.json()
    const r = data?.rates?.CAD
    if (typeof r !== 'number') throw new Error('Unexpected response')
    rate.value = r
    asOf.value = data.date || null
    fetchedAt.value = Date.now()
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      rate: rate.value,
      asOf: asOf.value,
      fetchedAt: fetchedAt.value
    }))
  } catch (e) {
    error.value = rate.value ? 'Offline — using cached rate' : (e?.message || 'Failed to fetch')
  } finally {
    loading.value = false
  }
}

const isStale = !fetchedAt.value || (Date.now() - fetchedAt.value) > STALE_AFTER
const online = typeof navigator === 'undefined' ? true : navigator.onLine !== false
if (isStale && online) refresh()

export function useCurrencyRate() {
  return { rate, asOf, fetchedAt, loading, error, refresh }
}
