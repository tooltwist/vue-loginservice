import Vue from 'vue'
import App from './App.vue'
import BannerLib from './components/index.js'

Vue.config.productionTip = false

Vue.use(BannerLib)

new Vue({
  render: h => h(App)
}).$mount('#app')
