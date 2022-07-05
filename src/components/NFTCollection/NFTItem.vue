<template>
  <div>{{item}}</div>
</template>

<script setup lang="ts">
import {defineProps} from "vue";

defineProps(
    {
      data: {
        type: Array,
        default: () => {}
      }
    }
)
</script>

<style scoped lang="scss">
.container {
  display: flex;
  flex-direction: column;
  color: white;
  width: 100%;
  height: fit-content;
}
</style>
