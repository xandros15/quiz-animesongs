<template>
    <div :class="{'is-active': isModalOpen}" class="modal">
        <div @click="close" class="modal-background"></div>
        <div class="modal-content">
            <slot></slot>
        </div>
    </div>
</template>

<script>
  import { mapMutations, mapState } from 'vuex'

  export default {
    name: 'Modal',
    computed: mapState({isModalOpen: state => state.modal.length > 0}),
    methods: mapMutations({close: 'modal.close'}),
  }
</script>

<style scoped>
    .modal-content {
        padding: 1rem;
        border-radius: 1rem;
        background-color: #fff;
    }
</style>
