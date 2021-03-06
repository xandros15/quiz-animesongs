<template>
    <div id="generator">
        <div>
            <router-link to="/">Go to game</router-link>
        </div>
        <div>
            <label>Count: </label>{{ list.length }}
        </div>
        <div style="margin: 0 -0.25rem 1rem -0.25rem">
            <Import :list="list" @clear="clearList" @import="importList"/>
        </div>
        <div style="margin: 0 -0.25rem 1rem -0.25rem" v-if="list.length > 0">
            <button @click="showSongs" class="button">Show songs</button>
        </div>
        <div class="search field has-addons">
            <p class="control">
                <button :disabled="disabled" @click="prev" class="button" v-if="hasPrev">Prev</button>
            </p>
            <p class="control">
                <input class="input" placeholder="Search songs to your list" title="search songs to your list"
                       type="text"
                       v-model.trim="search">
            </p>
            <p>
                <button :disabled="disabled" @click="next" class="button" v-if="hasNext">Next</button>
            </p>
        </div>
        <main class="generator-main">
            <table class="table" v-if="songs.length > 0">
                <thead>
                <tr>
                    <TblTh>
                        <input :checked="hasAllSelected" @click="toggleAll" title="select all songs" type="checkbox">
                    </TblTh>
                    <TblTh :order="order" @orderBy="orderBy" name="song">song</TblTh>
                    <TblTh :order="order" @orderBy="orderBy" name="artist">artist</TblTh>
                    <TblTh :order="order" @orderBy="orderBy" name="anime">anime</TblTh>
                    <TblTh>start</TblTh>
                    <TblTh>middle</TblTh>
                    <TblTh>end</TblTh>
                </tr>
                </thead>
                <tbody>
                <GenSong :inlist="list.indexOf(song.id) !== -1"
                         :key="song.id"
                         :sample="song.sample"
                         :song="song"
                         @click="toggleSong(song.id)"
                         @play="playSample"
                         v-for="song in sortedSongs"/>
                </tbody>
            </table>
        </main>
    </div>
</template>

<script>
  import { debounce } from 'lodash'
  import api from '../api/meta'
  import { existsMultiple } from '../api/songs'
  import GenSong from './GenSong'
  import Import from './Import'
  import TblTh from './TblTh'

  export default {
    name: 'generator',
    components: {
      TblTh,
      GenSong,
      Import,
    },
    created () {
      this.debouncedSearch = debounce(this.searchSong, 500)
      if (localStorage.getItem('songList')) this.list = JSON.parse(localStorage.getItem('songList'))
    },
    watch: {
      search () {
        this.debouncedSearch()
      },
      list: {
        handler () {
          localStorage.setItem('songList', this.jsonList)
        },
        deep: false,
      }
    },
    data () {
      return {
        order: [],
        player: new Audio(),
        songs: [],
        search: '',
        nextPage: '',
        prevPage: '',
        list: [],
        exporting: false,
        disabled: false,
        openImport: false,
      }
    },
    computed: {
      sortedSongs () {
        let songs = [...this.songs]
        const orders = [...this.order]
        orders.reverse()
        songs.sort((a, b) => {
          for (const order of orders) {
            const {type, name} = order
            let compare = 0
            switch (name) {
              case 'song':
                compare = ('' + a.name).localeCompare(b.name)
                break
              case 'artist':
                compare = ('' + a.artists[0].name).localeCompare(b.artists[0].name)
                break
              case 'anime':
                compare = ('' + a.anime[0].name).localeCompare(b.anime[0].name)
                break
            }
            if (type === 'DESC') {
              compare *= -1
            }
            if (compare > 0) return 1
            if (compare < 0) return -1
          }
        })
        return songs
      },
      hasAllSelected () {
        for (const song of this.songs) {
          if (!song.sample.start && !song.sample.middle && !song.sample.end) {
            continue
          }
          if (this.list.indexOf(song.id) === -1) {
            return false
          }
        }
        return true
      },
      jsonList () {
        return JSON.stringify(this.list)
      },
      hasNext () {
        return this.nextPage.length > 0
      },
      hasPrev () {
        return this.prevPage.length > 0
      },
    },
    methods: {
      orderBy (sort) {
        const orderIndex = this.order.findIndex(i => i.name === sort)
        if (orderIndex === -1) {
          this.order.push({name: sort, type: 'ASC'})
        } else {
          const {name, type} = this.order[orderIndex]
          this.order.splice(orderIndex, 1)
          if (type === 'ASC') {
            this.order.push({
              name,
              type: 'DESC'
            })
          }
        }
      },
      async showSongs () {
        if (this.disabled) {
          return
        }
        this.disabled = true
        this.songs = []
        this.search = this.nextPage = this.prevPage = ''
        const exists = await existsMultiple(this.list)
        for (const song of await api.getSongs(this.list)) {
          const exist = exists.find(({id}) => song.id === id)
          song.sample = exist ? exist.sample : {
            start: false,
            middle: false,
            end: false,
          }
          this.songs.push(song)
        }
        this.disabled = false
      },
      async searchSong () {
        if (this.disabled) {
          return
        }
        if (!this.player.paused) {
          this.player.pause()
        }
        if (this.search) {
          this.disabled = true
          await api.searchSongs(this.search).then(this.parseSongs)
          this.disabled = false
        } else {
          this.songs = []
        }
      },
      async next () {
        if (this.nextPage && !this.disabled) {
          if (!this.player.paused) {
            this.player.pause()
          }
          this.disabled = true
          await api.request(this.nextPage).then(this.parseSongs)
          this.disabled = false
        }
      },
      async prev () {
        if (this.prevPage && !this.disabled) {
          if (!this.player.paused) {
            this.player.pause()
          }
          this.disabled = true
          await api.request(this.prevPage).then(this.parseSongs)
          this.disabled = false
        }
      },
      async parseSongs ({songs, meta}) {
        const {next, previous} = meta.pagination.links
        this.nextPage = next || ''
        this.prevPage = previous || ''
        const exists = await existsMultiple(songs.map(song => song.id))
        this.songs = songs.map(song => {
          const exist = exists.find(({id}) => song.id === id)
          song.sample = exist ? exist.sample : {
            start: false,
            middle: false,
            end: false,
          }
          return song
        })
      },
      toggleAll ({target}) {
        if (!target.checked) {
          for (const song of this.songs) {
            this.list = this.list.filter(i => i !== song.id)
          }
        } else {
          for (const song of this.songs) {
            if ((song.sample.start || song.sample.middle || song.sample.end) &&
              this.list.indexOf(song.id) === -1
            ) {
              this.list.push(song.id)
            }
          }
        }
      },
      toggleSong (id) {
        if (this.list.indexOf(id) === -1) {
          this.list.push(id)
        } else {
          this.list = this.list.filter(i => i !== id)
        }
      },
      importList (list) {
        this.list = list
      },
      clearList () {
        this.list = []
      },
      playSample ({sample, id}) {
        const src = `https://songs.animesongs.org/${sample}-sample-${id}.mp3`
        if (!this.player.paused) {
          this.player.pause()
          if (src === this.player.src) {
            return
          }
        }
        this.player.volume = 0.3
        this.player.src = src
        this.player.currentTime = 0
        const promise = this.player.play()
        if (promise !== undefined) {
          promise.then().catch(error => alert(error))
        }
      }
    }
  }
</script>

<style scoped>
    #generator {
        margin: 0 1rem;
    }
    .search {
        max-width: 300px;
        margin: 1rem 0;
    }
    .generator-main {
        display: flex;
        justify-content: left;
        align-items: center;
    }
</style>