import Vue from 'vue'
import VueRouter from 'vue-router'
import Game from '../components/Game'
import GameStandard from '../components/GameStandard'
import Generator from '../components/Generator'
import Reports from '../components/Reports'
import Uploader from '../components/Uploader'

Vue.use(VueRouter)

const routes = [
  {
    path: '',
    component: Game
  },
  {
    path: '/game',
    component: GameStandard
  },
  {
    path: '/generator',
    component: Generator
  },
  {
    path: '/upload',
    component: Uploader
  },
  {
    path: '/reports',
    component: Reports
  }
]

export default new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes // short for `routes: routes`
})
