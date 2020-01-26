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
    html, body {
        height: 100%;
        padding: 0;
        margin: 0;
    }
    #app {
        font-family: 'Avenir', Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
    }
</style>
