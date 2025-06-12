<script setup>
  import { computed } from 'vue';
  import {
    useShuffeledCardsStore,
    useCompletedCardsStore,
    useHandCardsStore,
  } from '@/stores';
  import PlayingCardsContainer from '@/components/PlayingCardsContainer.vue';
  import { getCardDetails, loadCardsFromPublishedCSV, drawCard } from '@/utils';
  import { Button } from '@/components/ui/button';

  const shuffledCardsIds = useShuffeledCardsStore();
  const completedCardsIds = useCompletedCardsStore();
  const handCardsIds = useHandCardsStore();

  const handCards = computed(() =>
    handCardsIds.cards.map(getCardDetails).filter(Boolean)
  );
  const completedCards = computed(() =>
    completedCardsIds.cards.map(getCardDetails).filter(Boolean)
  );
  const hasTaskCardInHand = computed(() => {
    return handCards.value.some((card) => card.type === 'Úkol');
  });
</script>
<template>
  <div class="bg-white text-black p-4 w-screen flex flex-col">
    <div class="w-full h-full flex-1 overflow-y-auto">
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

    <div class="bg-white p-2 pb-4 flex flex-col gap-2 z-10">
      <Button
        @click="drawCard"
        :disabled="
          handCards.length + completedCards.length ===
            shuffledCardsIds.cards.length || hasTaskCardInHand
        "
        class="tabular-nums"
      >
        Líznout kartu
      </Button>
      <div class="grid grid-cols-2 gap-2">
        <Button @click="shuffledCardsIds.shuffleCards" variant="outline">
          Zamíchat balíček
        </Button>
        <Button @click="loadCardsFromPublishedCSV" variant="outline">
          Fetch data
        </Button>
      </div>
    </div>
  </div>
</template>
