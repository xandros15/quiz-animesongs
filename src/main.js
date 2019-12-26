import Vue from 'vue'
import VModal from 'vue-js-modal'
import ShortKey from 'vue-shortkey'
import App from './App.vue'
import router from './router'
import store from './store'

Vue.use(ShortKey)
Vue.use(VModal)

Vue.config.productionTip = false

new Vue({
  store,
  router,
  render: h => h(App)
}).$mount('#app')
