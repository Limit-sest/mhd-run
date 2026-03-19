<script setup lang="ts">
  import { ref, watch } from 'vue';
  import { fetchAllData } from '@/utils';
  import {
    useShuffeledCardsStore,
    usePlayerStore,
    useLocationsStore,
    useGameSettingsStore,
  } from '@/stores';
  import { Button } from '@/components/ui/button';
  import { Input } from '@/components/ui/input';
  import { Label } from '@/components/ui/label';
  import { Slider } from '@/components/ui/slider';
  import { Switch } from '@/components/ui/switch';
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
  const gameSettings = useGameSettingsStore();

  const coinsInput = ref(playerStore.coins);
  const powerupInput = ref(playerStore.gems);
  const radiusMinInput = ref(locationsStore.radiusSetting.min);
  const radiusMaxInput = ref(locationsStore.radiusSetting.max);
  const multiplierSlider = ref([gameSettings.multiplier]);
  const multiplierInput = ref(gameSettings.multiplier);
  const vetoInput = ref(gameSettings.baseVetoDuration);

  watch(multiplierSlider, (val) => {
    multiplierInput.value = val[0];
    gameSettings.setMultiplier(val[0]);
  }, { deep: true });

  const handleMultiplierInput = () => {
    const val = parseFloat(multiplierInput.value.toString()) || 1;
    gameSettings.setMultiplier(val);
    multiplierSlider.value = [gameSettings.multiplier];
  };

  const handleSetVeto = () => {
    gameSettings.setBaseVetoDuration(parseFloat(vetoInput.value.toString()) || 4);
  };

  const handleSetCurrencies = (): void => {
    playerStore.setCoins(parseInt(coinsInput.value.toString(), 10) || 0);
    playerStore.setGems(parseInt(powerupInput.value.toString(), 10) || 0);
  };

  const handleSetRadius = (): void => {
    locationsStore.setRadiusSetting(
      parseFloat(radiusMinInput.value.toString()) || 0,
      parseFloat(radiusMaxInput.value.toString()) || 0
    );
  };

  const handleReset = (): void => {
    playerStore.setCoins(70);
    playerStore.setGems(0);
    playerStore.resetOwnedPowerups();
    shuffledCardsIds.shuffleCards();
    locationsStore.resetLocation();
  };

  const handleFetch = async (): Promise<void> => {
    fetchLoading.value = true;
    try {
      await fetchAllData();
    } catch {
      window.alert('Failed to fetch data. Check your connection.');
    } finally {
      fetchLoading.value = false;
    }
  };
</script>
<template>
  <div class="flex flex-col gap-6 m-4">
    <div class="flex flex-col gap-2">
      <Label>{{ $t('settings.multiplier') }}</Label>
      <div class="flex items-center gap-4">
        <Slider
          :model-value="multiplierSlider"
          :min="0.3"
          :max="3"
          :step="0.1"
          @update:model-value="(value) => (multiplierSlider = value)"
          class="shrink"
        />
        <div class="flex items-center">
          <Input
            class="w-16 p-2 mr-1"
            :model-value="multiplierInput"
            @update:model-value="(value) => (multiplierInput = Number(value))"
            @change="handleMultiplierInput"
            type="number"
            step="0.1"
          />
          <p class="font-medium">x</p>
        </div>
      </div>
      <span class="text-xs text-gray-500">{{ $t('settings.multiplier-hint') }}</span>
    </div>
    <div class="flex flex-col gap-2">
      <Label>{{ $t('settings.veto-duration') }}</Label>
      <div class="flex gap-2">
        <Input type="number" v-model="vetoInput" class="w-20" />
        <Button @click="handleSetVeto" variant="secondary">{{
          $t('settings.save')
        }}</Button>
      </div>
    </div>
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
      <div class="flex items-center gap-2 mt-1">
        <Switch
          :checked="gameSettings.radiusAffectedByMultiplier"
          @update:checked="(val) => gameSettings.setRadiusAffectedByMultiplier(val)"
        />
        <Label class="text-sm">{{ $t('settings.radius-multiplier') }}</Label>
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
        @click="handleFetch"
        :disabled="fetchLoading"
      >
        <Loader2 class="animate-spin w-4 h-4 mr-1" v-if="fetchLoading" />
        {{ $t('settings.fetch') }}
      </Button>
    </div>
  </div>
</template>
