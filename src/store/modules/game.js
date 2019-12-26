import { answer, getSongs, getSongsFromLocal } from '../../api/songs'
import { getTitles } from '../../api/titles'
import GameStatus from './GameStatus'

export default {
  state: {
    status: GameStatus.SETUP,
    songs: [],
    index: -1,
    volumeVal: 50,
    volumeCache: 0,
    settings: {},
    reply: false,
    answerCorrect: false,
    hints: [],
    engine: null,
    guess: '',
    score: 0,
    maxScore: 0,
    loadedImage: false,
  },
  getters: {
    isFirstSong (state) {
      return state.index === -1
    },
    isLastSong (state) {
      return state.songs.length === state.index + 1
    },
    nextSong (state) {
      return state.songs[state.index + 1] || false
    },
    currentSong (state) {
      return state.songs[state.index] || false
    },
    volume (state) {
      return state.volumeVal / 100
    }
  },
  mutations: {
    ['mute'] (state) {
      state.volumeCache = state.volumeVal
      state.volumeVal = 0
    },
    ['unmute'] (state) {
      state.volumeVal = state.volumeCache
      state.volumeCache = 0
    },
    ['correct'] (state) {
      state.score++
      state.answerCorrect = true
      state.status = GameStatus.ANSWERED
    },
    ['incorrect'] (state) {
      state.answerCorrect = false
      state.status = GameStatus.ANSWERED
    },
    ['start'] (state) {
      state.songs = []
      state.index = -1
      state.score = 0
      state.status = GameStatus.LOADING
    },
    ['next'] (state) {
      state.loadedImage = false
      state.status = GameStatus.PLAY
      state.guess = ''
      state.index++
    },
    ['finish'] (state) {
      state.status = GameStatus.END
    },
    ['wait'] (state) {
      state.status = GameStatus.WAITING
    },
    ['setup'] (state) {
      state.status = GameStatus.SETUP
    },
    ['pass'] (state) {
      state.status = GameStatus.PASS
    },
    ['setHint'] (state, hint) {
      state.hint = hint
    },
    ['setSongs'] (state, songs) {
      state.songs = songs
      state.maxSongs = songs.length
    },
    ['setSettings'] (state, settings) {
      state.settings = settings
    },
  },
  actions: {
    ['mute'] ({commit, state}) {
      return state.volumeCache > 0 ? commit('unmute') : commit('mute')
    },
    ['correct'] ({commit, state, getters,}) {
      if (!state.settings.ownList) {
        answer(getters.currentSong.id, true)
      }
      getters.currentSong.sound.pause()
      commit('correct')
    },
    ['incorrect'] ({commit, state, getters,}) {
      if (!state.settings.ownList) {
        answer(getters.currentSong.id, false)
      }
      getters.currentSong.sound.pause()
      commit('incorrect')
    },
    ['answer'] ({dispatch, getters, state}, {name, id}) {
      if (!getters.currentSong) {
        return
      }
      id = parseInt(id)
      for (const anime of getters.currentSong.anime) {//strict mode
        const anidbId = parseInt(anime.anidbId)
        if (anidbId === id) {
          return dispatch('correct')
        }
      }
      if (name.length < 3) { //if your answer is less than 3 chars, then only strict mode works
        return dispatch('incorrect')
      }
      const animeIds = getters.currentSong.anime.map(anime => parseInt(anime.anidbId))
      state.hint.search(name, hints => {
        const guessIds = hints.map(({id}) => parseInt(id))
        for (const id of animeIds) {
          if (guessIds.indexOf(id) !== -1) {
            return dispatch('correct')
          }
        }
        return dispatch('incorrect')
      }, () => {})
    },
    async ['load'] ({state, commit,}, settings) {
      commit('start')
      //load titles
      if (!state.engine || settings.language !== state.settings.language) {
        const acceptLang = ['en', settings.language]
        const hint = await getTitles(acceptLang)
        commit('setHint', hint)
      }
      //load songs
      let songs = []
      if (settings.ownList && localStorage.getItem('songList')) {
        const list = JSON.parse(localStorage.getItem('songList'))
        songs = await getSongsFromLocal({list, settings})
      } else {
        songs = await getSongs({settings})
      }
      commit('setSongs', songs)
      commit('setSettings', settings)

      state.songs && state.songs.length > 0 ? commit('wait') : commit('finish')
    },
    ['replay'] ({getters}) {
      if (getters.currentSong && getters.currentSong.sound.paused) {
        return getters.currentSong.sound.play()
      }
    },
    ['stop'] ({getters}) {
      if (getters.currentSong && !getters.currentSong.sound.paused) {
        getters.currentSong.sound.pause()
      }
    },
    async ['next'] ({state, commit, dispatch, getters}) {
      if (state.songs.length > 0 && getters.nextSong) {
        await dispatch('stop')
        commit('next')
        let loaded = false
        getters.currentSong.sound.src = getters.currentSong.sample
        getters.currentSong.sound.volume = getters.volume
        const play = () => {
          loaded = true
          getters.currentSong.sound.play()
          getters.currentSong.sound.removeEventListener('canplaythrough', play)
        }
        getters.currentSong.sound.addEventListener('canplaythrough', play)
        setTimeout(() => {
          if (!loaded) {
            dispatch('next')
          }
        }, 5000)
        getters.currentSong.sound.load()
      } else if (!getters.nextSong) {
        dispatch('stop')
        commit('finish')
      }
    },
    ['reset'] ({dispatch, commit}) {
      dispatch('stop')
      commit('setup')
    },
    ['pass'] ({state, commit, rootCommit, dispatch, getters,}) {
      if (state.isModalOpen) {
        rootCommit('modal.close')
      } else if (getters.currentSong) {
        answer(getters.currentSong.id, false)
        dispatch('stop')
        commit('pass')
      }
    },
  },
}
