<script setup>
  import { ref } from 'vue';
  import { loadAndProcessCards } from '@/utils';
  import {
    useShuffeledCardsStore,
    usePlayerStore,
    useAllCardsStore,
  } from '@/stores';
  import { Button } from '@/components/ui/button';
  import { Input } from '@/components/ui/input';
  import { Label } from '@/components/ui/label';

  const shuffledCardsIds = useShuffeledCardsStore();
  const allCards = useAllCardsStore();
  const playerStore = usePlayerStore();

  const coinsInput = ref(playerStore.coins);
  const powerupInput = ref(playerStore.powerup);

  const cardCsv = import.meta.env.VITE_PUBLIC_CSV_URL;

  const handleSetCoins = () => {
    playerStore.setCoins(parseInt(coinsInput.value, 10) || 0);
  };

  const handleSetPowerup = () => {
    playerStore.setPowerup(parseInt(powerupInput.value, 10) || 0);
  };
</script>
<template>
  <div class="flex flex-col gap-3 m-4">
    <div class="grid grid-cols-2 gap-2">
      <Button @click="shuffledCardsIds.shuffleCards" variant="outline">
        Zamíchat balíček
      </Button>
      <Button
        @click="loadAndProcessCards(cardCsv, allCards, shuffledCardsIds)"
        variant="outline"
      >
        Fetch data
      </Button>
    </div>
    <div class="flex flex-col gap-2">
      <Label for="coins">Počet mincí</Label>
      <div class="flex gap-2">
        <Input id="coins" type="number" v-model="coinsInput" />
        <Button @click="handleSetCoins">Nastavit</Button>
      </div>
    </div>
    <div class="flex flex-col gap-2">
      <Label for="powerups">Počet powerupů</Label>
      <div class="flex gap-2">
        <Input id="powerups" type="number" v-model="powerupInput" />
        <Button @click="handleSetPowerup">Nastavit</Button>
      </div>
    </div>
  </div>
</template>
