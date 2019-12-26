<template>
    <div @shortkey="modalClose" id="game" v-shortkey="['esc']">
        <div v-if="isStatus('loading')">
            <h2 class="is-size-3">Loading...</h2>
            <figure>
                <img alt="loading" src="../assets/raw.gif">
            </figure>
        </div>
        <div v-else>
            <Settings :default="lastSettings" @start="load" v-if="isStatus('setup')"/>
            <div v-else>
                <div class="element">
                    <div class="volume-panel">
                        <label @click="mute" class="volume-label" for="volume">Volume:</label>
                        <input autocomplete="false" class="slider is-info" id="volume" max="100" min="0" step="1"
                               type="range" v-model="volumeVal">
                    </div>
                </div>
                <div class="element" v-if="isStatus('end')">
                    <h3 class="title is-3">Score {{score}}/{{maxScore}}</h3>
                    <button @click="reset" @shortkey="reset"
                            class="button is-warning" v-shortkey="['space']">
                        Reset?
                    </button>
                </div>
                <div class="element" v-else>
                    <h3 class="title is-3">Song {{index + 1}}/{{songs.length}}</h3>
                </div>
                <div class="element" v-if="isStatus(['waiting', 'answered', 'pass',])">
                    <Replay @replay="replay" @stop="stop" v-if="isStatus(['answered', 'pass',])"/>
                    <button @click="next"
                            @shortkey="next" class="button is-success"
                            v-if="!isStatus('end')" v-shortkey="['space']">
                        {{ isLastSong ? 'Show Score' : 'Play Song' }}
                    </button>
                </div>
                <div class="element" v-if="isStatus('play')">
                    <button @click="pass" @shortkey="pass"
                            class="button is-info" v-shortkey="['esc']"
                    >Pass
                    </button>
                </div>
                <div class="element" v-if="isStatus('answered')">
                    <h2 class="has-text-success is-size-3" v-if="answerCorrect">Correct!</h2>
                    <h2 class="has-text-danger is-size-3" v-else>Wrong</h2>
                </div>
                <div v-if="isStatus('play')">
                    <div class="element">
                        <input @shortkey="focusAnswer" class="input" style="max-width: 200px" title="guess"
                               v-model="guess" v-on:keyup.esc="unFocusAnswer" v-shortkey="['f']"
                               v-shortkey.avoid
                        />
                    </div>
                    <div :key="key" class="element" v-for="(hint, key) in hints">
                        <button @click="answer({name: hint.title, id: hint.id})"
                                @shortkey="answer({name: hint.title, id: hint.id})"
                                class="button"
                                v-shortkey="['alt', key + 1]">
                            {{hint.title}}
                        </button>
                    </div>
                </div>
                <div class="element" v-if="isStatus(['answered', 'pass',]) && currentSong">
                    <report-button :songId="currentSong.id"/>
                    <h2 class="title is-3">
                        <a :href="`https://animesongs.org/song/${currentSong.id}`" target="_blank">
                            {{ currentSong.name }}
                        </a>
                    </h2>
                    <h3 class="subtitle is-4">{{ currentSong.official }}</h3>
                    <figure>
                        <image-loader>
                            <img :alt="currentSong.anime[0].name + ' label'"
                                 :src="`https://img.animesongs.org/${currentSong.anime[0].anidbId}.jpg`"
                                 slot="image">
                        </image-loader>
                    </figure>
                    <div style="margin-bottom: 1rem">
                        <h3 :key="anime.anidbId" class="title is-5" v-for="anime in currentSong.anime">
                            <a :href="'https://anidb.net/a' + anime.anidbId" target="_blank">{{anime.name}}</a>
                        </h3>
                    </div>
                    <div style="margin-bottom: 1rem">
                        <div :key="key" v-for="(artist,key) in currentSong.artists">
                            <b>{{ artist.credit }}</b>: {{artist.name}}
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <KeyBindsButton/>
        <Modal>
            <KeyBindsHelp v-if="modalType === 'KeyBind'"/>
        </Modal>
    </div>
</template>

<script>
  import { mapMutations, mapState } from 'vuex'
  import { answer, getSongs, getSongsFromLocal } from '../api/songs'
  import { getTitles } from '../api/titles'
  import STATUS from '../store/modules/GameStatus'
  import ImageLoader from './ImageLoader'
  import KeyBindsButton from './KeyBindsButton'
  import KeyBindsHelp from './KeyBindsHelp'
  import Modal from './Modal'
  import Replay from './Replay'
  import ReportButton from './ReportButton'
  import Settings from './Settings'

  export default {
    name: 'game',
    components: {
      KeyBindsButton,
      Modal,
      ReportButton,
      ImageLoader,
      KeyBindsHelp,
      Settings,
      Replay,
    },
    data () {
      return {
        status: STATUS.SETUP,
        songs: [],
        index: -1,
        volumeVal: 50,
        volumeCache: 0,
        lastSettings: {},
        reply: false,
        answerCorrect: false,
        hints: [],
        engine: null,
        guess: '',
        score: 0,
        maxScore: 0,
        loadedImage: false,
      }
    },
    watch: {
      volumeVal () {
        if (this.currentSong) {
          this.currentSong.sound.volume = this.volume
          if (this.volumeVal > 0) {
            this.volumeCache = 0
          }
        }
      },
      guess () {
        const callback = hints => {
          let doubleWorldTitles = []
          if (this.guess.length > 5 && this.guess.indexOf(' ') !== -1) {//when we have 2 same worlds like princess princess
            const [word1, word2] = this.guess.split(' ')
            if (word1 === word2) {
              doubleWorldTitles = hints.filter(hint => hint.title.toLowerCase() === this.guess.toLowerCase()).slice(0, 5)
            }
          }
          return this.hints = doubleWorldTitles.concat(hints.sort((a, b) => a.title.length - b.title.length)
            .slice(0, 5 - doubleWorldTitles.length))
        }

        this.engine.search(this.guess, callback, callback)
      },
    },
    computed: {
      ...mapState({
        modalType: state => state.modal,
        isModalOpen: state => state.modal.length > 0,
      }),
      isFirstSong () {
        return this.index === -1
      },
      isLastSong () {
        return this.songs.length === this.index + 1
      },
      nextSong () {
        return this.songs[this.index + 1]
      },
      currentSong () {
        return this.songs[this.index]
      },
      volume () {
        return this.volumeVal / 100
      }
    },
    methods: {
      ...mapMutations({modalClose: 'modal.close'}),
      mute () {
        if (this.volumeCache > 0) {
          this.volumeVal = this.volumeCache
          this.volumeCache = 0
        } else {
          this.volumeCache = this.volumeVal
          this.volumeVal = 0
        }
      },
      focusAnswer ({target}) {
        if (document.activeElement !== target) {
          target.focus()
        }
      },
      unFocusAnswer ({target}) {
        if (document.activeElement === target) {
          target.blur()
        }
      },
      isStatus (type) {
        if (Array.isArray(type)) {
          type = type.map(i => i.toUpperCase())
          for (const i of type) {
            if (STATUS[i] === this.status) {
              return true
            }
          }
        } else {
          type = type.toUpperCase()
          return STATUS[type] === this.status
        }
        return false
      },
      correct () {
        this.answerCorrect = true
        if (!this.lastSettings.ownList) {
          answer(this.currentSong.id, true)
        }
        this.score++
        this.currentSong.sound.pause()
        this.status = STATUS.ANSWERED
      },
      incorrect () {
        this.answerCorrect = false
        if (!this.lastSettings.ownList) {
          answer(this.currentSong.id, false)
        }
        this.currentSong.sound.pause()
        this.status = STATUS.ANSWERED
      },
      answer ({name, id}) {
        if (!this.currentSong) {
          return
        }
        id = parseInt(id)
        this.loadedImage = false
        for (const anime of this.currentSong.anime) {//strict mode
          const anidbId = parseInt(anime.anidbId)
          if (anidbId === id) {
            return this.correct()
          }
        }
        if (name.length < 3) { //if your answer is less than 3 chars, then only strict mode works
          return this.incorrect()
        }
        const animeIds = this.currentSong.anime.map(anime => parseInt(anime.anidbId))
        this.engine.search(name, hints => {
          const guessIds = hints.map(({id}) => parseInt(id))
          for (const id of animeIds) {
            if (guessIds.indexOf(id) !== -1) {
              return this.correct()
            }
          }
          return this.incorrect()
        }, () => {})
      },
      async load (settings) {
        this.songs = []
        this.index = -1
        this.score = 0
        this.status = STATUS.LOADING

        //load titles
        if (!this.engine || settings.language !== this.lastSettings.language) {
          const acceptLang = ['en', settings.language]
          this.engine = await getTitles(acceptLang)
        }

        //load songs
        if (settings.ownList && localStorage.getItem('songList')) {
          const list = JSON.parse(localStorage.getItem('songList'))
          this.songs = await getSongsFromLocal({list, settings})
        } else {
          this.songs = await getSongs({settings})
        }
        this.maxScore = this.songs.length
        if (this.songs && this.songs.length > 0) {
          this.status = STATUS.WAITING
        } else {
          this.status = STATUS.END
        }
        this.lastSettings = settings
      },
      replay () {
        if (this.currentSong && this.currentSong.sound.paused) {
          const replay = () => {
            this.currentSong.sound.play()
            this.currentSong.sound.removeEventListener('canplaythrough', replay)
          }

          this.currentSong.sound.addEventListener('canplaythrough', replay)
          this.currentSong.sound.load()
        }
      },
      stop () {
        if (this.currentSong && !this.currentSong.sound.paused) {
          this.currentSong.sound.pause()
        } else if (this.currentSong) {
          const callback = () => {
            this.currentSong.sound.pause()
            this.currentSong.sound.removeEventListener('play', callback)
          }
          this.currentSong.sound.addEventListener('play', callback)
        }
      },
      async next () {
        if (this.songs.length > 0 && this.nextSong) {
          this.status = STATUS.PLAY
          this.guess = ''
          this.stop()
          this.index++
          this.currentSong.sound.src = this.currentSong.sample
          this.currentSong.sound.volume = this.volume
          let loaded = false
          const play = () => {
            loaded = true
            this.currentSong.sound.play()
            this.currentSong.sound.removeEventListener('canplaythrough', play)
          }
          this.currentSong.sound.addEventListener('canplaythrough', play)
          setTimeout(() => {
            if (!loaded) {
              this.next()
            }
          }, 5000)
          this.currentSong.sound.load()
        } else if (!this.nextSong) {
          this.status = STATUS.END
          this.stop()
        }
      },
      reset () {
        this.status = STATUS.SETUP
        this.stop()
      },
      pass () {
        if (this.isModalOpen) {
          this.modalClose()
        } else if (this.currentSong) {
          this.status = STATUS.PASS
          this.stop()
        }
      },
    }
  }
</script>

<style lang="scss">
    #game {
        text-align: center;
    }

    body::after {
        content: url(../assets/raw.gif);
        position: absolute;
        width: 0;
        height: 0;
        overflow: hidden;
        z-index: -1;
    }

    .element {
        margin-bottom: 1rem;
    }

    .volume-panel {
        display: inline-flex;
        align-items: center;
    }

    .volume-label {
        -webkit-user-select: none; /* webkit (safari, chrome) browsers */
        -moz-user-select: none; /* mozilla browsers */
        -ms-user-select: none; /* IE10+ */
        cursor: pointer;
        margin-right: 5px;
    }
</style>
