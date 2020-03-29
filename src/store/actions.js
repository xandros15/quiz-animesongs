export default {
  ['login'] ({commit}, {auth}) {
    localStorage.auth = auth
    commit('setAuth', {auth})
  },
  ['logout'] ({commit}) {
    localStorage.removeItem('auth')
    commit('setAuth', {auth: null})
  },
  ['openKeyBindModal'] ({commit}) {
    commit('modal.open', 'KeyBind')
  }
}
