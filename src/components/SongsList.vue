<template>
    <div id="song-list-modal">
        <div class="field">
            <div class="control">
                <textarea @click="select" class="textarea" placeholder="load..." readonly title="songs"
                          v-model="textList"></textarea>
            </div>
        </div>
        <div class="field is-grouped">
            <div class="control">
                <button @click="loadList" class="button">Load</button>
            </div>
        </div>
    </div>
</template>

<script>
  import api from '../api/meta'

  export default {
    name: 'SongsList',
    props: {
      'list': Array,
    },
    data () {
      return {
        songs: [],
      }
    },
    computed: {
      textList () {
        return this.songs.map((song, index) => {
          let types = []
          for (const anime of song.anime) {
            types = types.concat(anime.types)
          }
          types = types.filter((value, index, array) => array.indexOf(value) === index)
          return `${index + 1}. ${song.anime[0].name} ${song.name} ${song.artists.map(a => a.name).join('/')} ${song.year} [${types.join(',')}]`
        }).join('\r\n')
      },
    },
    methods: {
      select (event) {
        event.target.setSelectionRange(0, this.textList.length)
      },
      async loadList () {
        this.songs = await api.getSongs(this.list)
      },
    },
  }
</script>

<style scoped>
</style>
