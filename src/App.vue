<template>
  <header class="top">
    <h1>
      <img class="logo" src="/icon.svg" alt="" />
      {{ caLeft ? 'CA' : 'US' }} &harr; {{ caLeft ? 'US' : 'CA' }} Convert
    </h1>
    <button class="swap" @click="toggle" aria-label="Swap input order">
      <span :class="{ on: caLeft }">CA</span>
      <span class="swap-arrow">&harr;</span>
      <span :class="{ on: !caLeft }">US</span>
    </button>
  </header>

  <InstallPrompt />

  <div :class="{ 'us-left': !caLeft }">
    <BiConverter
      title="Temperature"
      left-label="Celsius"
      right-label="Fahrenheit"
      left-unit="°C"
      right-unit="°F"
      :forward="c => c * 9 / 5 + 32"
      :backward="f => (f - 32) * 5 / 9"
      :decimals="1"
    />

    <BiConverter
      title="Distance"
      left-label="Kilometres"
      right-label="Miles"
      left-unit="km"
      right-unit="mi"
      :forward="km => km / 1.609344"
      :backward="mi => mi * 1.609344"
      :decimals="2"
    />

    <PaceCard />
    <CurrencyCard />
    <GasPriceCard />
  </div>
</template>

<script setup>
import BiConverter from './components/BiConverter.vue'
import PaceCard from './components/PaceCard.vue'
import CurrencyCard from './components/CurrencyCard.vue'
import GasPriceCard from './components/GasPriceCard.vue'
import InstallPrompt from './components/InstallPrompt.vue'
import { useSideOrder } from './composables/useSideOrder.js'

const { caLeft, toggle } = useSideOrder()
</script>
