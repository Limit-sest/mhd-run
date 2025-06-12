<script setup>
  import BottonBar from './components/BottonBar.vue';
  import TopBar from './components/TopBar.vue';
</script>

<template>
  <div style="height: 100svh" class="flex flex-col">
    <TopBar />
    <div class="flex-1 flex overflow-y-scroll">
      <RouterView class="flex-1" />
    </div>
    <BottonBar />
  </div>
</template>
