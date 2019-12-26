<template>
    <div @keyup.esc="opened = false">
        <button @click="opened = true" class="button">Import</button>
        <div @click="close" class="modal-wrapper" v-if="opened">
            <div class="modal-container">
                <div class="modal-row close-row">
                    <button @click="reset" class="button">Reset</button>
                    <button @click="opened = false" class="button">Close</button>
                </div>
                <div class="modal-row">
                    <div class="field">
                        <label class="label" for="import">Import</label>
                        <div class="control">
                            <textarea class="textarea" id="import" v-model.trim="importText"></textarea>
                        </div>
                    </div>
                    <div class="field">
                        <div class="control">
                            <button @click.prevent="importSongs" class="button">Import</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
  export default {
    name: 'import',
    props: {
      list: Array
    },
    data () {
      return {
        importText: JSON.stringify(this.list),
        opened: false,
      }
    },
    watch: {
      list () {
        this.importText = this.list.length > 0 ? JSON.stringify(this.list) : ''
      }
    },
    computed: {
      jsonList () {
        return this.list.length > 0 ? JSON.stringify(this.list) : ''
      }
    },
    methods: {
      reset () {
        if (confirm('Are you sure?')) {
          this.$emit('import', [])
        }
      },
      close (e) {
        if (this.opened && e.target.classList.contains('modal-wrapper')) {
          this.opened = false
        }
      },
      importSongs () {
        try {
          this.$emit('import', JSON.parse(this.importText))
          this.opened = false
        } catch (e) {
          return false
        }
      }
    }
  }
</script>

<style lang="scss" scoped>
    .modal-wrapper {
        position: fixed;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        background-color: #000a;
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 333;
    }

    .modal-container {
        min-width: 360px;
        padding: 1rem;
        background-color: #fff;
        border-radius: .3rem;
    }

    .modal-row {
        margin-bottom: 1rem;
    }

    textarea {
        margin-bottom: .5rem;
    }

    .close-row {
        display: flex;
        justify-content: space-between;
    }
</style>