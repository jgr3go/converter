<template>
  <section class="card">
    <h2>Pace</h2>
    <div class="pair">
      <div class="field">
        <label>min/km</label>
        <input
          type="text"
          inputmode="numeric"
          autocomplete="off"
          placeholder="0:00"
          v-select-on-focus
          :value="displayKm"
          @input="onKm($event.target.value)"
        />
      </div>
      <span class="arrow">&harr;</span>
      <div class="field">
        <label>min/mi</label>
        <input
          type="text"
          inputmode="numeric"
          autocomplete="off"
          placeholder="0:00"
          v-select-on-focus
          :value="displayMi"
          @input="onMi($event.target.value)"
        />
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onResume } from '../composables/useResetOnResume.js'

const KM_PER_MI = 1.609344
const MAX_DIGITS = 5 // up to 999:99

// Raw digit strings for each side. Display format shifts digits in from
// the right, iOS-timer-style: "5" -> 0:05, "53" -> 0:53, "530" -> 5:30.
const kmDigits = ref('')
const miDigits = ref('')

function extractDigits(raw) {
  return (raw || '').replace(/\D/g, '').slice(0, MAX_DIGITS)
}
function digitsToDisplay(d) {
  if (!d) return ''
  if (d.length <= 2) return `0:${d.padStart(2, '0')}`
  const min = parseInt(d.slice(0, -2), 10)
  const sec = d.slice(-2)
  return `${min}:${sec}`
}
function digitsToSec(d) {
  if (!d) return null
  const padded = d.padStart(3, '0')
  const min = parseInt(padded.slice(0, -2), 10)
  const sec = parseInt(padded.slice(-2), 10)
  return min * 60 + sec
}
function secToDigits(total) {
  if (!Number.isFinite(total) || total < 0) return ''
  let min = Math.floor(total / 60)
  let sec = Math.round(total - min * 60)
  if (sec === 60) { min += 1; sec = 0 }
  return String(min) + String(sec).padStart(2, '0')
}

const displayKm = computed(() => digitsToDisplay(kmDigits.value))
const displayMi = computed(() => digitsToDisplay(miDigits.value))

function onKm(raw) {
  kmDigits.value = extractDigits(raw)
  const total = digitsToSec(kmDigits.value)
  miDigits.value = total === null ? '' : secToDigits(total * KM_PER_MI)
}
function onMi(raw) {
  miDigits.value = extractDigits(raw)
  const total = digitsToSec(miDigits.value)
  kmDigits.value = total === null ? '' : secToDigits(total / KM_PER_MI)
}

onResume(() => { kmDigits.value = ''; miDigits.value = '' })
</script>
