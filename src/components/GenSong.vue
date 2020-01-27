<template>
    <tr :class="{'is-selected': inlist, 'disabled': !hasFile}" class="song">
        <td>
            <input :checked="inlist" :disabled="!hasFile" :id="`song-${song.id}`" :title="`select ${song.name}`"
                   class="checkbox"
                   @click="select" type="checkbox">
        </td>
        <td>
            <a :for="`song-${song.id}`" @click.prevent="select" class="clickable" href="#"
               v-if="hasFile">
                {{song.name}} <small v-if="song.version && song.version.length > 0">({{ song.version }})</small>
            </a>
            <span v-else>
                {{song.name}} <small v-if="song.version && song.version.length > 0">({{ song.version }})</small>
            </span>
        </td>
        <td>
            {{song.artists[0].name}}
            <a href="#"><abbr :title="song.artists.map(i => i.name).join('/')" v-if="song.artists.length > 1">...</abbr></a>
        </td>
        <td>
            {{song.anime[0].name}} ({{song.anime[0].types.join(', ')}})
            <a href="#"><abbr :title="song.anime.map(i => i.name).join('/')" v-if="song.anime.length > 1">...</abbr></a>
        </td>
        <td>
            <button :class="sample.start ? 'is-success' : 'is-danger'"
                    :disabled="!sample.start"
                    @click.prevent="play('start')">
                &#9658;
            </button>
        </td>
        <td>
            <button :class="sample.middle ? 'is-success' : 'is-danger'"
                    :disabled="!sample.middle"
                    @click.prevent="play('middle')">
                &#9658;
            </button>
        </td>
        <td>
            <button :class="sample.end ? 'is-success' : 'is-danger'"
                    :disabled="!sample.end"
                    @click.prevent="play('end')">
                &#9658;
            </button>
        </td>
    </tr>
</template>

<script>

  export default {
    name: 'gen-song',
    components: {},
    props: {
      song: {type: Object, required: true},
      inlist: {type: Boolean},
      sample: {type: Object, required: true},
    },
    computed: {
      hasFile () {
        return this.sample.start || this.sample.middle || this.sample.end
      },
      types () {
        const types = []
        for (const anime of this.song.anime) {
          for (const type of anime.types) {
            if (types.indexOf(type) === -1) {
              types.push(type)
            }
          }
        }

        return types.join(', ')
      }
    },
    methods: {
      select () {
        if (this.hasFile) {
          this.$emit('click', this.song.id)
        }
      },
      play (sample) {
        if (!this.sample[sample]) {
          return
        }
        this.$emit('play', {sample, id: this.song.id})
      },
    },
  }
</script>

<style lang="scss" scoped>
    tr.is-selected {
        background-color: #d27214;
    }

    .clickable {
        cursor: pointer;
    }

    .disabled {
        opacity: .5;

        & .checkbox {
            cursor: not-allowed;
        }
    }

    .song {
        margin-bottom: 1rem;
    }
</style>