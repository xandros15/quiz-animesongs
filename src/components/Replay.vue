<template>
    <span class="replay">
        <button @click="toggle" class="button is-primary" v-if="!replay">
            Replay
        </button>
        <button @click="toggle" class="button is-primary" v-else>
            Stop
        </button>
    </span>
</template>

<script>
  export default {
    name: 'replay',
    data () {
      return {
        replay: false,
      }
    },
    methods: {
      toggle () {
        if (this.replay) {
          this.replay = false
          this.$emit('stop')
        } else {
          this.replay = true
          this.$emit('replay')
        }
      }
    },
  }
</script>

<style scoped>
    .replay {
        margin: 0 1rem;
    }
</style>