<template>
    <button @click="report" class="button button-report">Quality Report</button>
</template>

<script>
  import reportApi from '../api/report'

  export default {
    name: 'ReportButton',
    props: {songId: {type: String, required: true}},
    methods: {
      async report () {
        if (confirm('Are you sure to report this song?')) {
          this.$el.style.display = 'none'
          reportApi.addReport(this.songId).then(() => alert('Thanks for report.'))
        }
      },
    }
  }
</script>

<style lang="scss" scoped>
    .button-report {
        position: fixed;
        top: 0;
        right: 0;
        font-weight: bold;
        background-color: rgba(75, 0, 9, 0.8);
        color: #fff;
        font-size: 13px;

        &:hover, &:focus {
            color: #fff;
        }
    }
</style>