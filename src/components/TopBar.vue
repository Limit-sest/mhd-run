<script setup lang="ts">
  import { usePlayerStore } from '@/stores';
  import Badge from './Badge.vue';

  const playerStore = usePlayerStore();
</script>

<template>
  <div class="w-full h-12 border-b border-gray-300 bg-white px-4">
    <div class="flex items-center justify-center h-full w-full gap-3">
      <Badge variant="coin" size="large">{{ playerStore.coins }}</Badge>
      <Badge variant="gem" size="large">{{ playerStore.gems }}</Badge>
    </div>
  </div>
</template>
