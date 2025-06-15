<script setup>
  import { usePlayerStore } from '@/stores';

  const playerStore = usePlayerStore();
</script>

<template>
  <div class="w-full h-12 border-b border-gray-300 bg-white px-4">
    <div
      class="flex items-center justify-center h-full w-full gap-4 text-gray-800 text-lg font-semibold"
    >
      <span>{{ playerStore.coins }} 🪙</span>
      <span>{{ playerStore.powerup }} ⚡️</span>
    </div>
  </div>
</template>
