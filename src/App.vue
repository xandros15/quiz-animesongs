<template>
    <div id="app">
        <router-view/>
    </div>
</template>

<script>
  export default {
    name: 'app',
  }
</script>

<style lang="scss">
    $orange: #e47518;
    $info: $orange;
    $link: $orange;
    @import "~bulma";
    @import '~bulma-slider/src/sass';
    #app {
        font-family: 'Avenir', Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        color: #2c3e50;
        margin-top: 1rem;
    }
</style>
