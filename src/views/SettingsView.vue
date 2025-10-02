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
  import { Loader2 } from 'lucide-vue-next';
  import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
  } from '@/components/ui/tabs';
  import { i18n } from '../i18n';

  const fetchLoading = ref(false);

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
    playerStore.resetOwnedPowerups();
    shuffledCardsIds.shuffleCards();
    locationsStore.resetLocation();
  };
</script>
<template>
  <div class="flex flex-col gap-6 m-4">
    <div class="flex gap-2">
      <div class="flex flex-col gap-2">
        <Label for="coins">{{ $t('settings.coins') }}</Label>
        <Input id="coins" type="number" v-model="coinsInput" />
      </div>
      <div class="flex flex-col gap-2">
        <Label for="powerups">{{ $t('settings.gems') }}</Label>
        <Input id="powerups" type="number" v-model="powerupInput" />
      </div>
      <Button
        @click="handleSetCurrencies"
        class="self-end"
        variant="secondary"
        >{{ $t('settings.save') }}</Button
      >
    </div>
    <div class="flex flex-col gap-2">
      <Label>{{ $t('settings.goal-range') }}</Label>
      <div class="flex gap-2">
        <Input type="number" v-model="radiusMinInput" />
        <Input type="number" v-model="radiusMaxInput" />
        <Button @click="handleSetRadius" variant="secondary">{{
          $t('settings.save')
        }}</Button>
      </div>
    </div>
    <Label>{{ $t('settings.language') }}</Label>
    <Tabs
      :default-value="i18n.global.locale"
      class="w-full"
      v-model="i18n.global.locale"
    >
      <TabsList class="grid grid-cols-2 w-full">
        <TabsTrigger value="cs"> Čeština </TabsTrigger>
        <TabsTrigger value="en"> English </TabsTrigger>
      </TabsList>
    </Tabs>
    <div class="grid grid-cols-2 gap-2 mt-auto">
      <Button @click="handleReset"> {{ $t('settings.reset') }} </Button>
      <Button
        @click="
          async () => {
            fetchLoading = true;
            await fetchAllData();
            fetchLoading = false;
          }
        "
        :disabled="fetchLoading"
      >
        <Loader2 class="animate-spin w-4 h-4 mr-1" v-if="fetchLoading" />
        {{ $t('settings.fetch') }}
      </Button>
    </div>
  </div>
</template>
