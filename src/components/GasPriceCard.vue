<template>
  <section class="card">
    <h2>Gas Price</h2>
    <div class="pair">
      <div class="field">
        <label>¢ CAD / litre</label>
        <input type="number" step="any" inputmode="decimal" v-select-on-focus
          :value="cadC" @input="onCadC($event.target.value)" :disabled="!rate" />
      </div>
      <span class="arrow">&harr;</span>
      <div class="field">
        <label>USD / gallon</label>
        <input type="number" step="any" inputmode="decimal" v-select-on-focus
          :value="usdG" @input="onUsdG($event.target.value)" :disabled="!rate" />
      </div>
    </div>
    <div class="rate">
      <span v-if="rate">1 gal = 3.78541 L &middot; using 1 USD = {{ rate.toFixed(4) }} CAD</span>
      <span v-else>Needs currency rate (see above)</span>
    </div>
  </section>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useCurrencyRate } from '../composables/useCurrencyRate.js'

const L_PER_GAL = 3.78541
const { rate } = useCurrencyRate()

// cadC: Canadian cents per litre (e.g. 149.9)
// usdG: US dollars per gallon (e.g. 3.499)
const cadC = ref('')
const usdG = ref('')
const lastEdit = ref('cadC')

function round(n, d) {
  if (!Number.isFinite(n)) return ''
  const f = 10 ** d
  return (Math.round(n * f) / f).toString()
}

function onCadC(v) {
  cadC.value = v
  lastEdit.value = 'cadC'
  if (v === '' || v === '-') { usdG.value = ''; return }
  if (!rate.value) return
  const cents = parseFloat(v)
  if (!Number.isFinite(cents)) { usdG.value = ''; return }
  // cents/L -> CAD$/L -> CAD$/gal -> USD/gal
  const usdPerGal = ((cents / 100) * L_PER_GAL) / rate.value
  usdG.value = round(usdPerGal, 3)
}
function onUsdG(v) {
  usdG.value = v
  lastEdit.value = 'usdG'
  if (v === '' || v === '-') { cadC.value = ''; return }
  if (!rate.value) return
  const n = parseFloat(v)
  if (!Number.isFinite(n)) { cadC.value = ''; return }
  // USD/gal -> CAD$/gal -> CAD$/L -> cents/L
  const centsPerL = ((n * rate.value) / L_PER_GAL) * 100
  cadC.value = round(centsPerL, 1)
}

watch(rate, () => {
  if (!rate.value) return
  if (lastEdit.value === 'cadC') onCadC(cadC.value)
  else onUsdG(usdG.value)
})
</script>
