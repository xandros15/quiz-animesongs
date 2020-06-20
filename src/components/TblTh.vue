<template>
    <th>
        <a @click="$emit('orderBy', name)" href="#" title="" v-if="order">
            <span v-if="order.name === name">
                <span v-if="order.type === 'ASC'">▲</span>
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
      order: Object,
    },
  }
</script>

<style scoped>
</style>
