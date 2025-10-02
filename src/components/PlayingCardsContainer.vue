<script setup lang="ts">
  import PlayingCard from '@/components/PlayingCard.vue';
  import type { Card } from '@/types';

  interface Props {
    cards: Card[];
    title?: string;
    cardsDisabled?: boolean;
  }

  defineProps<Props>();
</script>

<template>
  <section>
    <h2 class="text-2xl font-semibold mb-4 tabular-nums">
      {{ title }}
    </h2>
    <div
      v-if="cards.length === 0"
      class="text-slate-600 italic p-4 text-center"
    >
      {{ $t('cards.no-cards') }}
    </div>
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-4">
      <PlayingCard
        v-for="card in cards"
        :key="card.id"
        :card="card"
        :disabled="cardsDisabled"
      />
    </div>
  </section>
</template>
