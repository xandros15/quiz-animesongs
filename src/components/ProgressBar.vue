<template>
    <div class="progress-container">
        <span :style="{width: statusPercent}" class="progress-bar"></span>
    </div>
</template>

<script>
  export default {
    name: 'ProgressBar',
    props: {
      status: Number
    },
    computed: {
      statusPercent () {
        return this.status * 100 + '%'
      }
    }
  }
</script>

<style lang="scss" scoped>
    .progress-container {
        position: fixed;
        z-index: 15;
        bottom: 0;
        left: 0;
        right: 0;

        & .progress-bar {
            transition: width .3s ease-in;
            height: .5rem;
            display: block;
            background-color: #e47518;
        }
    }
</style>
