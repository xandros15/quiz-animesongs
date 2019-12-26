export default {
  ['setAuth'] (state, {auth}) {
    state.auth = auth
  },
  ['modal.open'] (state, name) {
    state.modal = name
  },
  ['modal.close'] (state) {
    state.modal = ''
  }
}
