<template>
  <div class="container" v-for="item in data" :key="item.name" >
    <NFTItem :item="item" />
  </div>
</template>

<script setup lang="ts">
import {defineProps} from "vue";
import NFTItem from "./NFTItem.vue";

defineProps(
    {
      data: {
        type: Array,
        default: () => {}
      }
    }
)
</script>

<style scoped>
.container {
  color: white;
}
</style>
