<script setup lang="ts">
  import { ref } from 'vue';
  import { fetchAllData } from '@/utils';
  import { useShuffeledCardsStore, usePlayerStore } from '@/stores';
  import { Button } from '@/components/ui/button';
  import { Input } from '@/components/ui/input';
  import { Label } from '@/components/ui/label';

  const shuffledCardsIds = useShuffeledCardsStore();
  const playerStore = usePlayerStore();

  const coinsInput = ref(playerStore.coins);
  const powerupInput = ref(playerStore.powerup);

  const handleSetCoins = (): void => {
    playerStore.setCoins(parseInt(coinsInput.value.toString(), 10) || 0);
  };

  const handleSetPowerup = (): void => {
    playerStore.setPowerup(parseInt(powerupInput.value.toString(), 10) || 0);
  };
</script>
<template>
  <div class="flex flex-col gap-3 m-4">
    <div class="grid grid-cols-2 gap-2">
      <Button @click="shuffledCardsIds.shuffleCards" variant="outline">
        Zamíchat balíček
      </Button>
      <Button @click="fetchAllData" variant="outline"> Fetch data </Button>
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
