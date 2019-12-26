import Vue from 'vue'
import Vuex from 'vuex'
import actions from './actions'
import game from './modules/game'
import mutations from './mutations'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    auth: localStorage.auth || '',
    modal: '',
  },
  actions,
  mutations,
  modules: {
    game
  }
})
