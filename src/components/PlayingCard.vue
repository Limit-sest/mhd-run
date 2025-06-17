<script setup>
  import {
    Card,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from '@/components/ui/card';
  import { defineProps, onMounted } from 'vue';
  import { Button } from '@/components/ui/button';
  import { completeCard } from '@/utils';
  import { usePlayerStore } from '@/stores';

  const player = usePlayerStore();

  const props = defineProps({
    card: {
      type: Object,
      required: true,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  });

  onMounted(() => {
    if (props.card.type === 'Prokletí') {
      player.addCoins(props.card.rewardCoins);
      player.addPowerup(props.card.rewardPowerUp);
    }
  });
</script>

<template>
  <Card :class="[card.type === 'Prokletí' ? 'curse-glow' : '']">
    <CardHeader>
      <CardTitle class="uppercase text-base font-bold">{{
        card.title
      }}</CardTitle>
      <CardDescription>{{ card.description }}</CardDescription>
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
