<script setup>
  import BottonBar from './components/BottonBar.vue';
  import TopBar from './components/TopBar.vue';
  import { onMounted } from 'vue';
  import { fetchAllData } from './utils';
  import { useFetchTimestamp } from './stores';
  import { storeToRefs } from 'pinia';

  const fetchTimestamp = storeToRefs(useFetchTimestamp());

  onMounted(() => {
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
    <div class="hidden md:block mx-auto my-auto px-4">
      <p>
        This app is intended for phones only, but you can still try it here :)
      </p>
      <p class="mt-2"><strong>Basics of this game:</strong></p>
      <ol class="list-decimal list-inside mb-2">
        <li>You complete challenges to get coins</li>
        <li>
          The coins can be spent on transit, which you'll use to get to your
          goal and away from the chasers
        </li>
        <li>
          You either win by getting to you goal location, or you lose if chasers
          catch you
        </li>
      </ol>
      <a
        href="https://github.com/Limit-sest/mhd-run/blob/main/GAME_RULES.md"
        class="underline text-blue-600"
        >Read rules</a
      >
    </div>
  </div>
</template>
