import { ref } from 'vue'

const STORAGE_KEY = 'location-temp-v1'
const STALE_AFTER = 30 * 60 * 1000

const tempC = ref(null)
const location = ref(null)
const fetchedAt = ref(null)
const loading = ref(false)
const error = ref(null)

try {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (raw) {
    const p = JSON.parse(raw)
    if (typeof p.tempC === 'number') tempC.value = p.tempC
    if (typeof p.location === 'string') location.value = p.location
    if (typeof p.fetchedAt === 'number') fetchedAt.value = p.fetchedAt
  }
} catch {}

function getPosition() {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) return reject(new Error('Geolocation unavailable'))
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: false,
      timeout: 10_000,
      maximumAge: 10 * 60 * 1000
    })
  })
}

function formatLocation(geo) {
  const city = geo?.city || geo?.locality || ''
  const code = geo?.principalSubdivisionCode || ''
  const sub = code.includes('-') ? code.split('-').pop() : (geo?.principalSubdivision || '')
  if (city && sub) return `${city}, ${sub}`
  return city || sub || geo?.countryName || ''
}

async function refresh() {
  if (loading.value) return
  loading.value = true
  error.value = null
  try {
    const pos = await getPosition()
    const { latitude, longitude } = pos.coords
    const [weatherRes, geoRes] = await Promise.all([
      fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m`),
      fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`)
    ])
    if (!weatherRes.ok) throw new Error('Weather fetch failed')
    if (!geoRes.ok) throw new Error('Geocode fetch failed')
    const weather = await weatherRes.json()
    const geo = await geoRes.json()
    const t = weather?.current?.temperature_2m
    if (typeof t !== 'number') throw new Error('Unexpected weather response')
    const loc = formatLocation(geo)
    tempC.value = t
    location.value = loc
    fetchedAt.value = Date.now()
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      tempC: t, location: loc, fetchedAt: fetchedAt.value
    }))
  } catch (e) {
    error.value = e?.message || 'Failed to fetch'
  } finally {
    loading.value = false
  }
}

const isStale = !fetchedAt.value || (Date.now() - fetchedAt.value) > STALE_AFTER
const isReload = typeof performance !== 'undefined'
  && performance.getEntriesByType?.('navigation')[0]?.type === 'reload'
const online = typeof navigator === 'undefined' ? true : navigator.onLine !== false
if ((isStale || isReload) && online) refresh()

export function useLocationTemperature() {
  return { tempC, location, fetchedAt, loading, error, refresh }
}
