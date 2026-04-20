<template>
  <div v-if="show" class="install-banner">
    <template v-if="mode === 'ios'">
      <span class="msg">
        Install: tap <strong>Share</strong> then <strong>Add to Home Screen</strong>
      </span>
      <button class="dismiss" @click="dismiss" aria-label="Dismiss">&times;</button>
    </template>
    <template v-else-if="mode === 'prompt'">
      <span class="msg">Install this app</span>
      <button class="primary" @click="install">Install</button>
      <button class="dismiss" @click="dismiss" aria-label="Dismiss">&times;</button>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const DISMISS_KEY = 'install-dismissed-v1'

const show = ref(false)
const mode = ref('') // 'ios' | 'prompt'
let deferredPrompt = null

function isStandalone() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  )
}
function isIOS() {
  const ua = navigator.userAgent || ''
  const iPadOS = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1
  return /iPad|iPhone|iPod/.test(ua) || iPadOS
}

onMounted(() => {
  if (isStandalone()) return
  try { if (localStorage.getItem(DISMISS_KEY)) return } catch {}

  if (isIOS()) {
    mode.value = 'ios'
    show.value = true
    return
  }

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferredPrompt = e
    mode.value = 'prompt'
    show.value = true
  })

  window.addEventListener('appinstalled', () => {
    show.value = false
    deferredPrompt = null
  })
})

async function install() {
  if (!deferredPrompt) return
  deferredPrompt.prompt()
  const { outcome } = await deferredPrompt.userChoice
  deferredPrompt = null
  if (outcome === 'accepted') show.value = false
}

function dismiss() {
  show.value = false
  try { localStorage.setItem(DISMISS_KEY, '1') } catch {}
}
</script>
