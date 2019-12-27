<template>
    <div @shortkey="modalClose" id="game" v-shortkey="['esc']">
        <div v-if="isStatus('loading')">
            <h2 class="is-size-3">Loading...</h2>
            <figure>
                <img alt="loading" src="../assets/raw.gif">
            </figure>
        </div>
        <div v-else>
            <Settings :default="settings" @start="load" v-if="isStatus('setup')"/>
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
                    <h3 class="title is-3">Song {{songNumber}}/{{songsMax}}</h3>
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
                    <h2 class="has-text-success is-size-3" v-if="isCorrect">Correct!</h2>
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
                    <SongPreview :song="currentSong"/>
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
  import { mapActions, mapGetters, mapMutations, mapState } from 'vuex'
  import STATUS from '../store/modules/GameStatus'
  import KeyBindsButton from './KeyBindsButton'
  import KeyBindsHelp from './KeyBindsHelp'
  import Modal from './Modal'
  import Replay from './Replay'
  import ReportButton from './ReportButton'
  import Settings from './Settings'
  import SongPreview from './SongPreview'

  export default {
    name: 'game',
    components: {
      SongPreview,
      KeyBindsButton,
      Modal,
      ReportButton,
      KeyBindsHelp,
      Settings,
      Replay,
    },
    data () {
      return {
        volumeCache: 0,
        volumeVal: 50,
        guess: '',
      }
    },
    watch: {
      volumeVal () {
        this.$store.dispatch('changeVolume', this.volumeVal)
      },
      guess () {
        this.$store.dispatch('search', this.guess)
      },
    },
    computed: {
      ...mapState({
        modalType: state => state.modal,
        isModalOpen: state => state.modal.length > 0,
      }),
      ...mapGetters([
        'hints',
        'isFirstSong',
        'isLastSong',
        'nextSong',
        'currentSong',
        'volume',
        'settings',
        'score',
        'maxScore',
        'songNumber',
        'songsMax',
        'isCorrect',
        'status',
      ]),
    },
    methods: {
      ...mapMutations({modalClose: 'modal.close'}),
      ...mapActions([
        'load',
        'reset',
        'replay',
        'stop',
        'next',
        'pass',
      ]),
      mute () {
        if (this.volumeCache > 0) {
          this.$store.dispatch('changeVolume', this.volumeCache)
          this.volumeVal = this.volumeCache
          this.volumeCache = 0
        } else {
          this.$store.commit('mute')
          this.volumeCache = this.volumeVal
          this.volumeVal = 0
        }
      },
      answer (answer) {
        this.$store.dispatch('answer', answer).then(() => this.guess = '')
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
