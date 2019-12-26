export default {
  ['login'] ({commit}, {auth}) {
    localStorage.auth = auth
    commit('setAuth', {auth})
  },
  ['logout'] ({commit}) {
    localStorage.auth = null
    commit('setAuth', {auth: null})
  },
  ['openKeyBindModal'] ({commit}) {
    commit('modal.open', 'KeyBind')
  }
}
