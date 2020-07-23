<template>
    <div class="song-preview">
        <h2 class="title is-3">
            <a :href="`https://animesongs.org/song/${song.id}`" target="_blank">
                {{ song.name }}
            </a>
        </h2>
        <h3 class="subtitle is-4">{{ song.official }}</h3>
        <figure class="figure">
            <image-loader :class="{restricted: song.restricted}">
                <img :alt="song.anime[0].name + ' label'"
                     :src="`https://cdn.animesongs.org/images/${song.anime[0].anidbId}.jpg`"
                     slot="image">
            </image-loader>
        </figure>
        <div style="margin-bottom: 1rem">
            <h3 :key="anime.anidbId" class="title is-5" v-for="anime in song.anime">
                <a :href="'https://anidb.net/a' + anime.anidbId" target="_blank">{{anime.name}}</a>
                <small class="types">({{ anime.types.join(', ') }})</small>
            </h3>
        </div>
        <div style="margin-bottom: 1rem">
            <div :key="key" v-for="(artist,key) in song.artists">
                <b>{{ artist.credit }}</b>: {{artist.name}}
            </div>
        </div>
    </div>
</template>

<script>
  import ImageLoader from './ImageLoader'

  export default {
    name: 'SongPreview',
    components: {
      ImageLoader,
    },
    props: {song: {type: Object, required: true}},
  }
</script>

<style lang="scss" scoped>
    .types {
        margin-left: .5rem;
    }

    .figure {
        display: inline-block;
        overflow: hidden;
    }

    .restricted {
        filter: blur(40px);
    }
</style>
