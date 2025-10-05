<script setup lang="ts">
  import { computed } from 'vue';
  import { useCompletedCardsStore } from '@/stores';
  import PlayingCardsContainer from '@/components/PlayingCardsContainer.vue';
  import { getCardDetails } from '@/utils';
  import type { Card } from '@/types';
  import { ArrowLeft } from 'lucide-vue-next';
  import { Button } from '@/components/ui/button';

  const completedCardsIds = useCompletedCardsStore();
  const completedCards = computed(() =>
    completedCardsIds.cards
      .map(getCardDetails)
      .filter((card): card is Card => Boolean(card))
  );
</script>
<template>
  <div class="bg-white text-black p-4 pb-0 w-screen flex flex-col">
    <div class="w-full h-full flex-1 overflow-y-scroll">
      <PlayingCardsContainer
        :cards="completedCards"
        :title="$t('cards.completed')"
        :cardsDisabled="true"
      />
    </div>
    <div class="bg-white z-10 py-4">
      <Button @click="$router.push('/')" class="w-full" variant="outline">
        <ArrowLeft class="w-4 h-4 mr-1" />
        {{ $t('cards.back') }}
      </Button>
    </div>
  </div>
</template>
