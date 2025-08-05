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
  import { usePlayerStore } from '@/stores';

  const player = usePlayerStore();

  interface Props {
    card: CardType;
    disabled?: boolean;
  }

  defineProps<Props>();

  const formatTimestamp = (timestamp?: Date): string => {
    if (!timestamp) return 'Neznámé datum';
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('cs-CZ', {
      timeStyle: 'medium',
    }).format(date);
  };
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
      <div
        class="font-bold tabular-nums"
        v-if="player.doublePowerupCard.includes(card.id)"
      >
        Odměna:
        <span
          class="line-through font-normal text-gray-600"
          v-if="parseInt(card.rewardCoins) !== 0"
          >{{ card.rewardCoins }}
        </span>
        {{ parseInt(card.rewardCoins) * 2 }} 🪙
        <span
          class="line-through font-normal text-gray-600"
          v-if="parseInt(card.rewardPowerUp) !== 0"
          >{{ card.rewardPowerUp }}
        </span>
        {{ parseInt(card.rewardPowerUp) * 2 }} ⚡️
      </div>
      <div class="font-bold tabular-nums" v-else>
        Odměna: {{ card.rewardCoins }} 🪙 {{ card.rewardPowerUp }} ⚡️
      </div>
    </CardHeader>
    <CardFooter class="flex gap-2 w-full">
      <Button
        @click="completeCard(card.id, false)"
        variant="outline"
        :disabled="disabled"
        v-if="card.type !== 'Prokletí'"
        >Veto</Button
      >
      <Button
        @click="completeCard(card.id, card.type === 'Úkol')"
        variant="secondary"
        :disabled="disabled"
        class="flex-1"
        >Dokončit</Button
      >
    </CardFooter>
  </Card>
</template>
