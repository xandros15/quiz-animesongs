<template>
    <div class="volume-panel">
        <label @click="toggle" class="volume-label" for="volume">Volume:</label>
        <input autocomplete="false" class="slider is-info" id="volume" max="100" min="0" step="1"
               type="range" v-model.number="volumeVal">
    </div>
</template>

<script>
  export default {
    name: 'Volume',
    data () {
      return {
        volumeCache: 0,
        volumeVal: 50,
      }
    },
    watch: {
      volumeVal () {
        if (this.volumeVal > 0) {
          this.volumeCache = 0
        }
        this.$emit('modify', this.volumeVal)
      },
    },
    methods: {
      toggle () {
        if (this.volumeCache > 0) {
          this.$emit('unmute', this.volumeCache)
          this.volumeVal = this.volumeCache
          this.volumeCache = 0
        } else {
          this.$emit('mute')
          this.volumeCache = this.volumeVal
          this.volumeVal = 0
        }
      }
    }
  }
</script>

<style scoped>
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
