<script setup>
  import { computed } from 'vue';
  import {
    useShuffeledCardsStore,
    useCompletedCardsStore,
    useHandCardsStore,
    useDoublePowerupStore,
  } from '@/stores';
  import PlayingCardsContainer from '@/components/PlayingCardsContainer.vue';
  import { getCardDetails, drawCard } from '@/utils';
  import { Button } from '@/components/ui/button';
  import { BadgeDollarSign } from 'lucide-vue-next';

  const shuffledCardsIds = useShuffeledCardsStore();
  const completedCardsIds = useCompletedCardsStore();
  const handCardsIds = useHandCardsStore();
  const doublePowerup = useDoublePowerupStore();

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

    <div class="bg-white flex gap-2 z-10">
      <Button
        @click="doublePowerup.toggle()"
        :variant="doublePowerup.isActive ? '' : 'outline'"
        class="aspect-square"
        disabled
        ><BadgeDollarSign
      /></Button>
      <Button
        @click="drawCard"
        :disabled="
          handCards.length + completedCards.length ===
            shuffledCardsIds.cards.length || hasTaskCardInHand
        "
        class="tabular-nums flex-1"
      >
        Líznout kartu
      </Button>
    </div>
  </div>
</template>
