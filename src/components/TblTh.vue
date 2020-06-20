<template>
    <th>
        <a @click="$emit('orderBy', name)" href="#" title="" v-if="order">
            <span v-if="current">
                <span v-if="isAsc">▲</span>
                <span v-else>▼</span>
            </span>
            <slot/>
        </a>
        <span v-else>
            <slot/>
        </span>
    </th>
</template>

<script>
  export default {
    name: 'TblTh',
    props: {
      name: String,
      order: Array,
    },
    computed: {
      current () {
        for (const item of this.order) {
          if (item.name === this.name) {
            return item
          }
        }
        return false
      },
      isAsc () {
        return this.current && this.current.type === 'ASC'
      }
    }
  }
</script>

<style scoped>
</style>
