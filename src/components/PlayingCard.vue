<script setup>
  import {
    Card,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from '@/components/ui/card';
  import { defineProps } from 'vue';
  import { Button } from '@/components/ui/button';
  import { completeCard } from '@/utils';

  defineProps({
    card: {
      type: Object,
      required: true,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  });

  const formatTimestamp = (timestamp) => {
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
      <CardTitle class="uppercase text-base font-bold">{{
        card.title
      }}</CardTitle>
      <CardDescription class="text-gray-600"
        >Líznuto v {{ formatTimestamp(card.timestamp) }}</CardDescription
      >
      <CardDescription class="text-base">{{
        card.description
      }}</CardDescription>
      <div class="font-bold tabular-nums">
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
