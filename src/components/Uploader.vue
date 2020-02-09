<template>
    <Admin>
        <div id="uploader">
            <!-- uploader -->
            <div class="section">
                <div class="container">
                    <h1 class="title is-1 has-text-centered">Upload songs</h1>
                    <!-- form -->
                    <div class="card-container">
                        <div class="threshold-card card">
                            <label for="threshold">Threshold: {{threshold}}</label>
                            <input
                                    autocomplete="false"
                                    class="slider is-info"
                                    id="threshold"
                                    max="100"
                                    min="0"
                                    step="1"
                                    type="range"
                                    v-model.number="threshold"
                            >
                        </div>
                        <div class="upload-card card" v-if="!uploading">
                            <div class="upload-drop card-image">
                                <div :class="{'is-active': isDragged}" class="upload-drop-content">
                                    <div class="upload-drop-label">Drop songs</div>
                                </div>
                                <div :class="{'is-active': isDragged}" class="upload-drop-bg"></div>
                                <div class="upload-drop-bg-2"></div>
                                <div @dragleave.prevent="dragleave"
                                     @dragover.prevent="dragover"
                                     @drop.prevent="drop"
                                     class="upload-drop-area"
                                ></div>
                            </div>
                            <div class="card-content">
                                <div class="content upload-actions">
                                    <input @change="select" class="is-hidden" id="uploader-files" multiple type="file">
                                    <label class="file-picker" for="uploader-files">Chose songs</label>
                                </div>
                            </div>
                        </div>
                        <div class="list-card card" v-if="gotItems">
                            <div class="card-content">
                                <div class="content upload-actions">
                                    <ul v-if="list.length > 0">
                                        <li :key="item.id" v-for="item in list">
                                            <span v-if="item.state === UPLOAD_STATE.INIT">
                                            <span>
                                                &#9733;
                                            </span>
                                            In que "{{ item.name }}"
                                            </span>
                                            <span v-else-if="item.state === UPLOAD_STATE.UPLOADING">
                                            <span class="file-in-progress">&#9733;</span>
                                            Uploading "{{ item.name }}"
                                            <progress class="progress is-small is-default" max="100">15%</progress>
                                            </span>
                                            <span v-else-if="item.state === UPLOAD_STATE.ERROR">
                                            <span class="file-fail">
                                                &#9733;
                                            </span>
                                            {{ item.message }} "{{ item.name }}"
                                            </span>
                                            <span v-else-if="item.state === UPLOAD_STATE.DONE">
                                            <span class="file-success">
                                                &#9733;
                                            </span>
                                            Uploaded "{{ item.name }}"
                                            </span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </Admin>
</template>

<script>
  import Vue from 'vue'
  import { mapState } from 'vuex'
  import { upload } from '../api/songs'
  import Admin from './Admin'

  const UPLOAD_STATE = {
    'INIT': 1,
    'UPLOADING': 2,
    'ERROR': 3,
    'DONE': 4,
  }

  export default {
    name: 'uploader',
    components: {Admin},
    data () {
      return {
        UPLOAD_STATE,
        isDragged: false,
        uploading: false,
        threshold: 50,
        list: [],
      }
    },
    computed: {
      ...mapState({
        auth: state => state.auth,
      }),
      gotItems () {
        return this.list.length > 0
      }
    },
    methods: {
      dragover () {
        this.isDragged = true
      },
      dragleave () {
        this.isDragged = false
      },
      drop (e) {
        this.isDragged = false
        const files = e.dataTransfer.files
        this.upload(files)
      },
      select (e) {
        const files = e.target.files || e.dataTransfer.files
        this.upload(files)
        e.target.value = ''
      },
      async upload (files) {
        //prepare
        this.list = []
        let it = 0
        for (const file of files) {
          this.list[it] = {
            id: it,
            file: file,
            name: file.name,
            state: UPLOAD_STATE.INIT,
            message: '',
          }
          it++
        }

        //then upload
        this.uploading = true
        for (const item of this.list) {
          try {
            if (item.file.size > 0 && (item.file.type.indexOf('audio/mp3') === 0 || item.file.type.indexOf('audio/mpeg') === 0)) {
              item.state = UPLOAD_STATE.UPLOADING
              const response = await upload({
                file: item.file,
                threshold: this.threshold,
                auth: this.auth,
              }).catch(e => {
                item.message = e
                item.state = UPLOAD_STATE.ERROR
              })
              if (response.ok) {
                item.state = UPLOAD_STATE.DONE
              } else if (response.status === 400) {
                item.message = 'Bad file'
                item.state = UPLOAD_STATE.ERROR
              } else if (response.status === 401) {
                item.message = 'Unauthorized'
                item.state = UPLOAD_STATE.ERROR
              } else {
                item.message = item.state === UPLOAD_STATE.ERROR ? item.message : 'Server error'
                item.state = UPLOAD_STATE.ERROR
              }
            } else {
              item.message = 'Bad file'
              item.state = UPLOAD_STATE.ERROR
            }
          } catch (e) {
            item.message = 'Bad file'
            item.state = UPLOAD_STATE.ERROR
            // eslint-disable-next-line no-console
            console.error(e)
          }
          Vue.set(this.list, item.id, item)
        }

        this.uploading = false
      },
    }
  }
</script>

<style scoped>
    .file-picker {
        transition: opacity .3s;
        cursor: pointer;
    }
    .file-picker:hover {
        opacity: .7;
    }
    .card-container {
        display: flex;
        align-items: center;
        margin: auto;
        flex-direction: column;
    }
    .card {
        width: 480px;
    }
    .upload-actions {
        flex-direction: column;
        display: flex;
        align-items: center;
    }
    .upload-drop {
        position: relative;
        height: 320px;
        display: flex;
        justify-content: center;
    }
    .upload-drop-bg {
        background: radial-gradient(700px at 70% -20%, #e47518 0, #fff 100%);
        transition: opacity .3s;
        z-index: 1;
        width: 100%;
        height: 100%;
        position: absolute;
        top: 0;
        left: 0;
    }
    .upload-drop-bg-2 {
        background: radial-gradient(700px at -20% 70%, #e47518 0, #fff 100%);
        z-index: 0;
        width: 100%;
        height: 100%;
        position: absolute;
        top: 0;
        left: 0;
    }
    .upload-drop-bg.is-active {
        opacity: 0;
    }
    .threshold-card {
        padding-top: 1rem;
        display: flex;
        align-items: center;
        margin: auto;
        flex-direction: column;
    }
    .upload-drop-content {
        transition: opacity .3s;
        position: relative;
        z-index: 2;
        width: 300px;
        display: flex;
        justify-content: center;
        align-items: center;
        margin: auto;
    }
    .upload-drop-content.is-active {
        opacity: 0;
    }
    .upload-drop-label {
        border: 3px #4b4b4b dashed;
        border-radius: 3px;
        text-transform: capitalize;
        padding: 1rem;
        color: #4b4b4b;
        font-weight: bold;
    }
    .upload-drop-area {
        z-index: 3;
        width: 100%;
        height: 100%;
        position: absolute;
        top: 0;
        left: 0;
    }
    .progress.is-default {
        background-image: linear-gradient(to right, #e47518 30%, #ededed 30%);
    }
    .file-in-progress {
        color: #e47518;
    }
    .file-fail {
        color: #840000;
    }
    .file-success {
        color: #008400;
    }
</style>