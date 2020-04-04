<template>
    <Admin>
        <table v-if="reports.length > 0">
            <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Anime</th>
                <th>Reports</th>
                <th>Action</th>
            </tr>
            <tr :key="report.id" class="table-row" v-for="report in reports">
                <td class="table-cell">
                    <a :href="`https://animesongs.org/song/${report.id}`" target="_blank">{{report.id}}</a>
                </td>
                <td class="table-cell">{{report.name}}</td>
                <td class="table-cell">{{report.anime[0].name}}</td>
                <td class="table-cell">{{report.count}}</td>
                <td class="table-cell">
                    <a @click.prevent="remove(report.id)" href="#">x</a>
                </td>
            </tr>
        </table>
    </Admin>
</template>

<script>
  import { mapState } from 'vuex'
  import metaApi from '../api/meta'
  import reportApi from '../api/report'
  import Admin from './Admin'

  export default {
    name: 'Reports',
    components: {Admin},
    data () {
      return {
        reports: [],
      }
    },
    computed: {
      ...mapState({
        auth: state => state.auth,
      })
    },
    async created () {
      if (this.auth) {
        this.reports = []
        const {reports} = await reportApi.getReports({auth: this.auth})
        const songs = await metaApi.getSongs(reports.map(i => i.id))
        for (const report of reports) {
          const meta = songs.find(i => i.id === report.id)
          meta.count = report.count
          this.reports.push(meta)
        }
      }
    },
    methods: {
      remove (id) {
        reportApi.removeReport({id, auth: this.auth}).then(() => {
          this.reports = this.reports.filter(report => report.id !== id)
        })
      }
    }
  }
</script>

<style lang="scss" scoped>
    .table-cell {
        padding: 0 .3rem;
    }

    .table-row {
        &:hover {
            background-color: rgba(0, 0, 0, 0.3);
        }
    }
</style>
