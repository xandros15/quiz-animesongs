<template>
    <div class="load-image" style="height: 0">
        <slot name="image"/>
    </div>
</template>

<script>
  const Status = {
    PENDING: 'pending',
    LOADING: 'loading',
    LOADED: 'loaded',
    FAILED: 'failed'
  }
  export default {
    name: 'ImageLoader',
    data () {
      return {
        status: null,
        img: null,
        src: null,
      }
    },
    created () {
      this.src = this.$slots.image[0].data.attrs.src
      if (this.src) {
        this.status = Status.LOADING
        this.createLoader()
      } else {
        this.status = Status.PENDING
      }
    },
    updated () {
      const receivedSrc = this.$slots.image[0].data.attrs.src
      if (this.status === Status.LOADING && !this.img) {
        this.createLoader()
      } else if (this.src !== receivedSrc) {
        this.src = receivedSrc
        this.createLoader()
      }
    },
    watch: {
      src (value) {
        this.status = value ? Status.LOADING : Status.PENDING
      }
    },
    methods: {
      createLoader () {
        this.destroyLoader()
        this.img = new Image()
        this.img.onload = this.handleLoad
        this.img.onerror = this.handleError
        this.img.src = this.src
      },
      destroyLoader () {
        if (this.img) {
          this.img.onload = null
          this.img.onerror = null
          this.img = null
        }
      },
      handleLoad () {
        const height = this.img.height * 350 / this.img.width
        this.destroyLoader()
        this.status = Status.LOADED
        this.$el.style.height = Math.round(height) + 'px'
        this.$emit('onLoad')
      },
      handleError (error) {
        this.destroyLoader()
        this.status = Status.FAILED
        this.$emit('onError', error)
      }
    }
  }
</script>

<style scoped>
    .load-image {
        overflow: hidden;
        transition: height .2s ease-in;
        margin-bottom: 1rem;
    }
    .load-image > img {
        width: 350px;
    }
</style>