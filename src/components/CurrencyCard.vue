<template>
  <section class="card">
    <h2>Currency</h2>
    <div class="pair">
      <div class="field">
        <label>CAD</label>
        <div class="input-wrap">
          <input type="number" step="any" inputmode="decimal" v-select-on-focus
            :value="cad" @input="onCad($event.target.value)" :disabled="!rate" />
          <span class="prefix">$</span>
        </div>
      </div>
      <span class="arrow">&harr;</span>
      <div class="field">
        <label>USD</label>
        <div class="input-wrap">
          <input type="number" step="any" inputmode="decimal" v-select-on-focus
            :value="usd" @input="onUsd($event.target.value)" :disabled="!rate" />
          <span class="prefix">$</span>
        </div>
      </div>
    </div>
    <div class="rate">
      <span :class="{ err: error && !rate }">
        <template v-if="rate">
          1 USD = {{ rate.toFixed(4) }} CAD<span v-if="asOf"> &middot; {{ asOf }}</span>
        </template>
        <template v-else-if="loading">Loading rate&hellip;</template>
        <template v-else-if="error">{{ error }}</template>
        <template v-else>No rate available</template>
      </span>
      <button @click="refresh" :disabled="loading">{{ loading ? '…' : 'Refresh' }}</button>
    </div>
  </section>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useCurrencyRate } from '../composables/useCurrencyRate.js'

const { rate, asOf, loading, error, refresh } = useCurrencyRate()

const cad = ref('')
const usd = ref('')
const lastEdit = ref('cad')

function fmt(n) {
  if (!Number.isFinite(n)) return ''
  return (Math.round(n * 100) / 100).toString()
}

function onCad(v) {
  cad.value = v
  lastEdit.value = 'cad'
  if (v === '' || v === '-') { usd.value = ''; return }
  if (!rate.value) return
  const n = parseFloat(v)
  usd.value = Number.isFinite(n) ? fmt(n / rate.value) : ''
}
function onUsd(v) {
  usd.value = v
  lastEdit.value = 'usd'
  if (v === '' || v === '-') { cad.value = ''; return }
  if (!rate.value) return
  const n = parseFloat(v)
  cad.value = Number.isFinite(n) ? fmt(n * rate.value) : ''
}

watch(rate, () => {
  if (!rate.value) return
  if (lastEdit.value === 'cad') onCad(cad.value)
  else onUsd(usd.value)
})
</script>
