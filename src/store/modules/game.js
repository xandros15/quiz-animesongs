import { answer, getSongs, getSongsFromLocal } from '../../api/songs'
import { loadHinter, search } from '../../tools/hinter'
import { Player } from '../../tools/player'
import GameStatus from './GameStatus'
import GameTypes from './GameTypes'

const player = new Player()
const LOCAL_SETTINGS = 'game.standard.settings'

export default {
  state: {
    type: GameTypes.STANDARD,
    status: GameStatus.SETUP,
    songs: [],
    index: -1,
    volume: 0.5,
    settings: localStorage[LOCAL_SETTINGS] ? JSON.parse(localStorage[LOCAL_SETTINGS]) : {},
    reply: false,
    answerCorrect: false,
    hints: [],
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
    settings (state) {
      return state.settings
    },
    score (state) {
      return state.score
    },
    maxScore (state) {
      return state.songs.length
    },
    songNumber (state) {
      return state.index + 1
    },
    songsMax (state) {
      return state.songs.length
    },
    isCorrect (state) {
      return state.answerCorrect === true
    },
    status (state) {
      return state.status
    },
    hints (state) {
      return state.hints
    }
  },
  mutations: {
    ['mute'] (state) {
      state.volume = 0
    },
    ['changeVolume'] (state, volume) {
      state.volume = volume
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
    ['setHints'] (state, hints) {
      state.hints = hints
    },
    ['setGuess'] (state, guess) {
      state.guess = guess
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
    ['search'] ({commit, state}, guess) {
      commit('setGuess', guess)
      const callback = hints => {
        let doubleWorldTitles = []
        if (guess.length > 5 && guess.indexOf(' ') !== -1) {//when we have 2 same worlds like princess princess
          const [word1, word2] = guess.split(' ')
          if (word1 === word2) {
            doubleWorldTitles = hints.filter(hint => hint.title.toLowerCase() === guess.toLowerCase()).slice(0, 5)
          }
        }
        const newHints = doubleWorldTitles.concat(hints.sort((a, b) => a.title.length - b.title.length).slice(0, 5 - doubleWorldTitles.length))
        commit('setHints', newHints)
      }

      search(state.guess, callback, callback)
    },
    ['changeVolume'] ({commit, state,}, value) {
      commit('changeVolume', value / 100)
      player.changeVolume(state.volume)
    },
    ['correct'] ({commit, state, dispatch, getters,}) {
      if (!state.settings.ownList && state.settings.gameType !== GameTypes.ONE_NOTE) {
        answer(getters.currentSong.id, true)
      }
      dispatch('stop')
      commit('correct')
    },
    ['incorrect'] ({commit, state, dispatch, getters,}) {
      if (!state.settings.ownList && state.settings.gameType !== GameTypes.ONE_NOTE) {
        answer(getters.currentSong.id, false)
      }
      dispatch('stop')
      commit('incorrect')
    },
    ['answer'] ({dispatch, getters}, {name, id}) {
      if (!getters.currentSong) {
        return
      }
      id = parseInt(id)
      for (const anime of getters.currentSong.anime) {//strict mode
        const anidbId = parseInt(anime.anidbId)
        if (anidbId === id || anime.name.toLowerCase() === name.toLowerCase()) {
          return dispatch('correct')
        }
      }
      if (name.length < 3) { //if your answer is less than 3 chars, then only strict mode works
        return dispatch('incorrect')
      }
      const animeIds = getters.currentSong.anime.map(anime => parseInt(anime.anidbId))
      search(name, hints => {
        const guessIds = hints.map(({id}) => parseInt(id))
        for (const id of animeIds) {
          if (guessIds.indexOf(id) !== -1) {
            return dispatch('correct')
          }
        }
        return dispatch('incorrect')
      }, () => {})
    },
    async ['load'] ({state, commit, getters, dispatch}, settings) {
      commit('start')
      player.clear()
      //load titles
      if (!state.engine || settings.language !== state.settings.language) {
        const acceptLang = ['en',]
        if (settings.language) {
          acceptLang.push(settings.language)
        }
        await loadHinter(acceptLang)
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
      localStorage[LOCAL_SETTINGS] = JSON.stringify(settings)

      if (state.songs && state.songs.length > 0) {
        commit('wait')
        if (state.settings.gameType === GameTypes.ONE_NOTE) {
          player.loadOneNote(getters.nextSong.sample, () => dispatch('stop'))
        } else {
          player.load(getters.nextSong.sample)
        }
      } else {
        commit('finish')
      }
    },
    ['replay'] () {
      player.play()
    },
    ['stop'] () {
      player.stop()
    },
    async ['next'] ({state, commit, dispatch, getters}) {
      if (state.songs.length > 0 && getters.nextSong) {
        await dispatch('stop')
        commit('next')
        if (state.settings.gameType === GameTypes.ONE_NOTE) {
          player.loadOneNote(getters.nextSong.sample, () => dispatch('stop'))
        } else {
          player.load(getters.nextSong.sample)
        }
        player.play()
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
        if (!state.settings.ownList && state.settings.gameType !== GameTypes.ONE_NOTE) {
          answer(getters.currentSong.id, false)
        }
        dispatch('stop')
        commit('pass')
      }
    },
  },
}
