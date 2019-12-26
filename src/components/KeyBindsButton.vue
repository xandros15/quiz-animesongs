<template>
    <button @click="openKeyBindModal" class="button button-modal">Controls</button>
</template>

<script>
  import { mapActions } from 'vuex'

  export default {
    name: 'KeyBindsButton',
    methods: mapActions(['openKeyBindModal']),
  }
</script>

<style lang="scss" scoped>
    .button-modal {
        position: fixed;
        top: 0;
        left: 0;
        font-weight: bold;
        background-color: #000c;
        color: #fff;
        font-size: 13px;

        &:hover, &:focus {
            color: #fff;
        }
    }
</style>