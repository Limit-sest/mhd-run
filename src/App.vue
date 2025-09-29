<script setup>
  import BottonBar from './components/BottonBar.vue';
  import TopBar from './components/TopBar.vue';
  import { onMounted } from 'vue';
  import { fetchAllData } from './utils';
  import { useFetchTimestamp } from './stores';
  import { storeToRefs } from 'pinia';

  const fetchTimestamp = storeToRefs(useFetchTimestamp());

  onMounted(() => {
    console.log(fetchTimestamp.cards.value);
    if (!fetchTimestamp.cards.value) {
      fetchAllData(false);
      fetchTimestamp.cards.value = new Date().getTime();
    }
    if (new Date().getTime() - fetchTimestamp.cards.value > 600000) {
      fetchAllData(false);
      fetchTimestamp.cards.value = new Date().getTime();
    }
  });
</script>

<template>
  <div class="flex">
    <div class="w-full max-w-none md:max-w-md md:aspect-9/16">
      <div style="height: 100svh" class="flex flex-col">
        <TopBar />
        <div class="flex-1 flex overflow-y-scroll bg-white text-gray-900">
          <RouterView class="flex-1" />
        </div>
        <BottonBar />
      </div>
    </div>
    <div class="hidden md:block mx-auto my-auto">
      This app is intended for phones only, but you can still try it here :)
    </div>
  </div>
</template>
