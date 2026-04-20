import { createApp } from 'vue'
import App from './App.vue'
import './style.css'

const app = createApp(App)

app.directive('select-on-focus', {
  mounted(el) {
    const target = el.matches('input, textarea') ? el : el.querySelector('input, textarea')
    if (!target) return
    target.addEventListener('focus', () => {
      // Defer: iOS Safari places the caret after the focus event fires,
      // which would clobber a synchronous select().
      setTimeout(() => {
        try { target.select() } catch {}
      }, 0)
    })
  }
})

app.mount('#app')
