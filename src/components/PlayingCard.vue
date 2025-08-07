<script setup lang="ts">
  import {
    Card,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from '@/components/ui/card';
  import { Button } from '@/components/ui/button';
  import { completeCard } from '@/utils';
  import type { Card as CardType } from '@/types';
  import { usePlayerStore, useTimersStore } from '@/stores';
  import Badge from '@/components/Badge.vue';
  import { computed, ref, onMounted } from 'vue';
  import { Progress } from '@/components/ui/progress';
  import { X, Ban, Check } from 'lucide-vue-next';

  const player = usePlayerStore();
  const timers = useTimersStore();

  interface Props {
    card: CardType;
    disabled?: boolean;
  }

  const props = defineProps<Props>();

  const currentTime = ref(new Date());
  const progress = ref(100);
  let interval;

  onMounted(() => {
    if (props.card.timerEnd) {
      interval = setInterval(() => {
        currentTime.value = new Date();
        progress.value =
          100 -
          100 *
            ((currentTime.value.getTime() - props.card.timestamp.getTime()) /
              (props.card.timerEnd.getTime() - props.card.timestamp.getTime()));
      }, 1000);
    }
  });

  const formatTimestamp = (timestamp?: Date): string => {
    if (!timestamp) return 'Neznámé datum';
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('cs-CZ', {
      timeStyle: 'medium',
    }).format(date);
  };

  const timeRemaining = computed(() => {
    var _second = 1000;
    var _minute = _second * 60;
    var _hour = _minute * 60;
    var distance = props.card.timerEnd.getTime() - currentTime.value.getTime();
    if (distance < 0) {
      clearInterval(interval);
      completeCard(props.card.id);
      return;
    }
    var minutes = Math.floor((distance % _hour) / _minute);
    var seconds = String(Math.floor((distance % _minute) / _second)).padStart(
      2,
      '0'
    );
    return `${minutes}m${seconds}s`;
  });

  function handleVeto() {
    completeCard(props.card.id, false);
    timers.set('veto', 4);
  }
</script>

<template>
  <Card :class="[card.type === 'Prokletí' ? 'curse-glow' : '']">
    <CardHeader>
      <CardTitle class="uppercase text-lg">{{ card.title }}</CardTitle>
      <CardDescription class="text-gray-600"
        >Líznuto v {{ formatTimestamp(card.timestamp) }}</CardDescription
      >
      <CardDescription class="text-base">{{
        card.description
      }}</CardDescription>
      <div class="flex gap-2">
        <Badge
          variant="coin"
          v-if="
            player.doublePowerupCard.includes(card.id) &&
            parseInt(card.rewardCoins) !== 0
          "
          ><span class="opacity-40 line-through">{{ card.rewardCoins }}</span>
          {{ parseInt(card.rewardCoins) * 2 }}</Badge
        >
        <Badge variant="coin" v-else>{{ card.rewardCoins }}</Badge>
        <Badge
          variant="gem"
          v-if="
            player.doublePowerupCard.includes(card.id) &&
            parseInt(card.rewardPowerUp) !== 0
          "
          ><span class="opacity-40 line-through">{{ card.rewardPowerUp }}</span>
          {{ parseInt(card.rewardPowerUp) * 2 }}</Badge
        >
        <Badge variant="gem" v-else>{{ card.rewardPowerUp }}</Badge>
        <Badge
          variant="timer"
          v-if="card.timer && card.timerEnd.getTime() > new Date().getTime()"
          >{{ timeRemaining }}</Badge
        >
      </div>
    </CardHeader>
    <CardFooter class="flex gap-2 w-full">
      <Button
        @click="completeCard(card.id, false)"
        variant="outline"
        :disabled="disabled"
        v-if="card.type !== 'Prokletí'"
        size="icon"
        ><X class="w-4 h-4 opacity-70"
      /></Button>
      <Button
        @click="handleVeto"
        variant="outline"
        :disabled="disabled"
        v-if="card.type !== 'Prokletí'"
        ><Ban class="w-4 h-4 mr-1 opacity-70" />Veto</Button
      >
      <Button
        @click="completeCard(card.id, card.type === 'Úkol')"
        variant="secondary"
        :disabled="disabled"
        class="flex-1"
        v-if="!card.timerEnd"
        ><Check class="w-4 h-4 mr-1 opacity-70" />Dokončit</Button
      >
      <Progress
        v-if="card.timer && card.timerEnd.getTime() > new Date().getTime()"
        v-model="progress"
      />
    </CardFooter>
  </Card>
</template>
