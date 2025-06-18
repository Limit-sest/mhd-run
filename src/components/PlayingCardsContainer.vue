<script setup>
  import { defineProps } from 'vue';
  import PlayingCard from '@/components/PlayingCard.vue';

  defineProps({
    cards: {
      type: Array,
      required: true,
    },
    title: {
      type: String,
    },
    cardsDisabled: {
      type: Boolean,
    },
  });
</script>

<template>
  <section>
    <h2
      class="text-2xl font-semibold mb-4 border-b-2 border-neutral-500 tabular-nums"
    >
      {{ title }} ({{ cards.length }})
    </h2>
    <div
      v-if="cards.length === 0"
      class="text-slate-400 italic p-4 text-center"
    >
      Žádné karty
    </div>
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <PlayingCard
        v-for="card in cards"
        :key="card.id"
        :card="card"
        :disabled="cardsDisabled"
      />
    </div>
  </section>
</template>
