<template>
    <div>
        <div class="header">
            <h2 class="title">Controls</h2>
        </div>
        <div class="content">
            <table class="table">
                <tr :key="i" v-for="(bind,i) in keyBinds">
                    <td>
                        <div class="key-group">
                        <span :key="k" class="key-shortcut" v-for="(key,k) in bind.keySet">
                                {{key}}
                        </span>
                        </div>
                    </td>
                    <td>
                        <div class="key-description">{{bind.description}}</div>
                    </td>
                </tr>
            </table>
        </div>
    </div>
</template>

<script>
  import { isBrowser } from 'mobile-device-detect'

  export default {
    name: 'key-binds-help',
    data () {
      return {
        keyBinds: [
          {keySet: ['f'], description: 'Focus input'},
          {keySet: ['esc'], description: 'Blur input'},
          {keySet: ['esc',], description: 'Pass song'},
          {keySet: ['alt', '1-5'], description: 'Answer'},
          {keySet: ['Space'], description: 'Play'},
          {keySet: ['Space'], description: 'Reset'},
        ]
      }
    },
    methods: {
      show () {

        this.$modal.show('key-binds')
      },
      canShow () {
        return isBrowser
      }
    }
  }
</script>

<style lang="scss" scoped>
    .header {
        padding: .3rem;
        text-align: center;
    }

    .content {
        padding: 1rem;
        height: 100%;
    }

    .key {
        &-description {
            font-weight: 600;
        }

        &-group {
            display: flex;
        }

        &-shortcut {
            font-size: 12px;
            font-weight: 600;
            color: #f6f6f7;
            box-shadow: inset 0 -4px 0 rgba(35, 39, 42, .6);
            border: 1px solid #202225;
            background-color: #72767d;
            display: block;
            padding: 3px 6px 4px;
            margin-right: 3px;
            border-radius: 2px;
            min-width: 14px;
            min-height: 14px;
            text-align: center;
            box-sizing: border-box;
            position: relative;
            height: 23px;
        }
    }
</style>
