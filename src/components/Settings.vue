<template>
    <!-- settings -->
    <div class="settings">
        <div class="element">
            <label for="own-list">Own list
                <input id="own-list" type="checkbox" v-model="settings.ownList"/>
            </label>
            (
            <router-link to="/generator">generator</router-link>
            )
        </div>
        <div class="element">
            <b>Types:</b>
            <div>
                <label :for="`check-type-${type}`" :key="type" v-for="type of availableTypes">
                    {{ type.toUpperCase() }}
                    <input :disabled="settings.ownList" :id="`check-type-${type}`" :value="type"
                           @click="uncheck"
                           type="checkbox"
                           v-model="settings.types"
                    >
                </label>
            </div>
        </div>
        <div class="element">
            <b>Years:</b>
            <div>
                <div class="field">
                    <div class="control">
                        <input :disabled="settings.ownList" :max="MAX_YEAR" :min="MIN_YEAR" @blur="validateYears"
                               class="input"
                               placeholder="Year Minimum" title="first year" type="number"
                               v-model.number="settings.yearMin"
                        >
                    </div>
                </div>
                <div class="field">
                    <div class="control">
                        <input :disabled="settings.ownList" :max="MAX_YEAR" :min="MIN_YEAR" @blur="validateYears"
                               class="input"
                               placeholder="Year Maximum" title="last year" type="number"
                               v-model.number="settings.yearMax"
                        >
                    </div>
                </div>
            </div>
        </div>
        <div class="element">
            <div class="field">
                <label class="label" for="sample">Sample</label>
                <div class="control">
                    <div class="select">
                        <select id="sample" v-model="settings.sample">
                            <option :key="sample" :value="sample" v-for="sample in samples">
                                {{sample}}
                            </option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
        <div class="element">
            <div class="field">
                <label class="label" for="titles-lang">Titles Language</label>
                <small class="is-small">(english and japanese included)</small>
                <div class="control">
                    <div class="select">
                        <select id="titles-lang" v-model="settings.language">
                            <option :key="key" :value="value" v-for="(value, key) in titlesLanguage">
                                {{key}}
                            </option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
        <button @click="start" class="button">Start</button>
    </div>
</template>

<script>
  const MAX_YEAR = (new Date()).getFullYear()
  const MIN_YEAR = 1959

  export default {
    name: 'settings',
    props: {
      default: {type: Object},
    },
    data () {
      return {
        MAX_YEAR,
        MIN_YEAR,
        samples: [
          'random',
          'start',
          'middle',
          'end',
        ],
        titlesLanguage: {
          'Polish': 'pl',
          'German': 'de',
          'Spanish': 'es',
          'Italian': 'it',
        },
        availableTypes: ['op', 'ed', 'tm', 'in',],
        settings: {
          ownList: this.default.ownList || false,
          types: this.default.types || ['op', 'ed'],
          yearMax: this.default.yearMax || MAX_YEAR,
          yearMin: this.default.yearMin || MIN_YEAR,
          sample: this.default.sample || 'random',
          language: this.default.language || 'pl',
        }
      }
    },
    created () {
      if (this.lastSettings) {
        this.settings = this.lastSettings
      }
    },
    methods: {
      start () {
        this.$emit('start', this.settings)
      },
      validateYears () {
        if (this.settings.yearMax > MAX_YEAR) {
          this.settings.yearMax = MAX_YEAR
        }
        if (this.settings.yearMax < MIN_YEAR) {
          this.settings.yearMax = MIN_YEAR
        }
        if (this.settings.yearMin > MAX_YEAR) {
          this.settings.yearMin = MAX_YEAR
        }
        if (this.settings.yearMin < MIN_YEAR) {
          this.settings.yearMin = MIN_YEAR
        }
        if (this.settings.yearMin > this.settings.yearMax) {
          this.settings.yearMin = this.settings.yearMax
        }
      },
      uncheck (ev) {
        const {checked} = ev.target
        if (!checked && this.settings.types.length === 1) {
          ev.preventDefault()
        }
      },
    }
  }
</script>

<style scoped>
    .settings {
        max-width: 200px;
        margin: auto;
    }
    .control {
        display: flex;
        justify-content: center;
    }
</style>
