<template>
  <section class="card">
    <h2>{{ title }}</h2>
    <div class="pair">
      <div class="field">
        <label>{{ leftLabel }} ({{ leftUnit }})</label>
        <input
          type="number"
          step="any"
          inputmode="decimal"
          v-select-on-focus
          :value="left"
          @input="onLeft($event.target.value)"
        />
      </div>
      <span class="arrow">&harr;</span>
      <div class="field">
        <label>{{ rightLabel }} ({{ rightUnit }})</label>
        <input
          type="number"
          step="any"
          inputmode="decimal"
          v-select-on-focus
          :value="right"
          @input="onRight($event.target.value)"
        />
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  title: String,
  leftLabel: String,
  rightLabel: String,
  leftUnit: String,
  rightUnit: String,
  forward: Function,
  backward: Function,
  decimals: { type: Number, default: 2 }
})

const left = ref('')
const right = ref('')

function fmt(n) {
  if (!Number.isFinite(n)) return ''
  const f = 10 ** props.decimals
  return String(Math.round(n * f) / f)
}

function onLeft(v) {
  left.value = v
  if (v === '' || v === '-') { right.value = ''; return }
  const n = parseFloat(v)
  right.value = Number.isFinite(n) ? fmt(props.forward(n)) : ''
}
function onRight(v) {
  right.value = v
  if (v === '' || v === '-') { left.value = ''; return }
  const n = parseFloat(v)
  left.value = Number.isFinite(n) ? fmt(props.backward(n)) : ''
}
</script>
