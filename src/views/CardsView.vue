<script setup lang="ts">
  import { computed } from 'vue';
  import {
    useShuffeledCardsStore,
    useCompletedCardsStore,
    useHandCardsStore,
  } from '@/stores';
  import PlayingCardsContainer from '@/components/PlayingCardsContainer.vue';
  import { getCardDetails, drawCard } from '@/utils';
  import { Button } from '@/components/ui/button';
  import type { Card } from '@/types';

  const shuffledCardsIds = useShuffeledCardsStore();
  const completedCardsIds = useCompletedCardsStore();
  const handCardsIds = useHandCardsStore();

  const handCards = computed(() =>
    handCardsIds.cards
      .map(getCardDetails)
      .filter((card): card is Card => Boolean(card))
  );
  const completedCards = computed(() =>
    completedCardsIds.cards
      .map(getCardDetails)
      .filter((card): card is Card => Boolean(card))
  );
  const hasTaskCardInHand = computed(() => {
    return handCards.value.some((card: Card) => card.type === 'Úkol');
  });
</script>
<template>
  <div class="bg-white text-black p-4 pb-0 w-screen flex flex-col">
    <div class="w-full h-full flex-1 overflow-y-scroll">
      <div class="space-y-8">
        <!-- Hand Zone -->
        <PlayingCardsContainer
          :cards="handCards"
          title="Aktivní"
          :cardsDisabled="false"
        />
        <PlayingCardsContainer
          :cards="completedCards"
          title="Dokončené"
          :cardsDisabled="true"
        />
      </div>
    </div>
    <div class="bg-white z-10 py-4">
      <Button
        @click="drawCard"
        :disabled="
          handCards.length + completedCards.length ===
            shuffledCardsIds.cards.length || hasTaskCardInHand
        "
        class="tabular-nums w-full"
      >
        Líznout kartu
      </Button>
    </div>
  </div>
</template>
