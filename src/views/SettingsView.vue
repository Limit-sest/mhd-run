<script setup lang="ts">
  import { ref } from 'vue';
  import { fetchAllData } from '@/utils';
  import {
    useShuffeledCardsStore,
    usePlayerStore,
    useLocationsStore,
  } from '@/stores';
  import { Button } from '@/components/ui/button';
  import { Input } from '@/components/ui/input';
  import { Label } from '@/components/ui/label';

  const shuffledCardsIds = useShuffeledCardsStore();
  const playerStore = usePlayerStore();
  const locationsStore = useLocationsStore();

  const coinsInput = ref(playerStore.coins);
  const powerupInput = ref(playerStore.powerup);
  const radiusMinInput = ref(locationsStore.radiusSetting.min);
  const radiusMaxInput = ref(locationsStore.radiusSetting.max);

  const handleSetCurrencies = (): void => {
    playerStore.setCoins(parseInt(coinsInput.value.toString(), 10) || 0);
    playerStore.setPowerup(parseInt(powerupInput.value.toString(), 10) || 0);
  };

  const handleSetRadius = (): void => {
    locationsStore.setRadiusSetting(
      parseFloat(radiusMinInput.value.toString()) || 0,
      parseFloat(radiusMaxInput.value.toString()) || 0
    );
  };

  const handleReset = (): void => {
    playerStore.setCoins(70);
    playerStore.setPowerup(0);
    shuffledCardsIds.shuffleCards();
    locationsStore.resetLocation();
  };
</script>
<template>
  <div class="flex flex-col gap-6 m-4">
    <div class="flex gap-2">
      <div class="flex flex-col gap-2">
        <Label for="coins">Počet mincí</Label>
        <Input id="coins" type="number" v-model="coinsInput" />
      </div>
      <div class="flex flex-col gap-2">
        <Label for="powerups">Počet powerupů</Label>
        <Input id="powerups" type="number" v-model="powerupInput" />
      </div>
      <Button @click="handleSetCurrencies" class="self-end" variant="secondary"
        >Nastavit</Button
      >
    </div>
    <div class="flex flex-col gap-2">
      <Label>Rozsah losování lokací</Label>
      <div class="flex gap-2">
        <Input type="number" v-model="radiusMinInput" />
        <Input type="number" v-model="radiusMaxInput" />
        <Button @click="handleSetRadius" variant="secondary">Nastavit</Button>
      </div>
    </div>
    <div class="grid grid-cols-2 gap-2 mt-auto">
      <Button @click="handleReset"> Resetovat aplikaci </Button>
      <Button @click="fetchAllData"> Fetch data </Button>
    </div>
  </div>
</template>
