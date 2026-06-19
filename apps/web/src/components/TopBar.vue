<script setup lang="ts">
  import { usePlayerStore } from '@/stores';
  import Badge from './Badge.vue';
  import { watch, ref } from 'vue';

  const playerStore = usePlayerStore();

  const displayCoins = ref(playerStore.coins);
  const displayGems = ref(playerStore.gems);
  const coinDelta = ref<number | null>(null);
  const gemDelta = ref<number | null>(null);

  let coinTimeout: ReturnType<typeof setTimeout> | undefined;
  let gemTimeout: ReturnType<typeof setTimeout> | undefined;
  let coinRaf: ReturnType<typeof requestAnimationFrame> | undefined;
  let gemRaf: ReturnType<typeof requestAnimationFrame> | undefined;

  function animateValue(
    from: number,
    to: number,
    duration: number,
    onUpdate: (v: number) => void,
    cancelPrev: () => void,
    setRaf: (id: ReturnType<typeof requestAnimationFrame>) => void
  ) {
    cancelPrev();
    const start = performance.now();
    const diff = to - from;
    function step(now: number) {
      const t = Math.min((now - start) / duration, 1);
      onUpdate(Math.round(from + diff * t));
      if (t < 1) setRaf(requestAnimationFrame(step));
    }
    setRaf(requestAnimationFrame(step));
  }

  watch(
    () => playerStore.coins,
    (newVal, oldVal) => {
      if (oldVal === undefined) return;
      const diff = newVal - oldVal;
      if (diff === 0) return;
      coinDelta.value = diff;
      clearTimeout(coinTimeout);
      coinTimeout = setTimeout(() => {
        coinDelta.value = null;
      }, 800);
      animateValue(
        displayCoins.value,
        newVal,
        300,
        (v) => {
          displayCoins.value = v;
        },
        () => {
          if (coinRaf) cancelAnimationFrame(coinRaf);
        },
        (id) => {
          coinRaf = id;
        }
      );
    }
  );

  watch(
    () => playerStore.gems,
    (newVal, oldVal) => {
      if (oldVal === undefined) return;
      const diff = newVal - oldVal;
      if (diff === 0) return;
      gemDelta.value = diff;
      clearTimeout(gemTimeout);
      gemTimeout = setTimeout(() => {
        gemDelta.value = null;
      }, 800);
      animateValue(
        displayGems.value,
        newVal,
        300,
        (v) => {
          displayGems.value = v;
        },
        () => {
          if (gemRaf) cancelAnimationFrame(gemRaf);
        },
        (id) => {
          gemRaf = id;
        }
      );
    }
  );
</script>

<style scoped>
  @keyframes float-up {
    0% {
      opacity: 1;
      transform: translateY(24px);
    }
    100% {
      opacity: 0;
      transform: translateY(0px);
    }
  }

  @keyframes float-down {
    0% {
      opacity: 0;
      transform: translateY(0);
    }
    20% {
      opacity: 0.5;
    }
    80% {
      opacity: 1;
      transform: translateY(24px);
    }
    100% {
      opacity: 0;
      transform: translateY(24px);
    }
  }

  .float-positive {
    animation: float-up 500ms ease-out forwards;
  }

  .float-negative {
    animation: float-down 500ms ease-out forwards;
  }
</style>

<template>
  <div class="w-full h-12 border-b border-gray-300 bg-white px-4">
    <div class="flex items-center justify-center h-full w-full gap-3">
      <Badge variant="coin" size="large" class="min-w-16">
        <span class="relative">
          {{ displayCoins }}
          <span
            v-if="coinDelta !== null"
            :key="'c' + coinDelta + Date.now()"
            :class="[
              coinDelta > 0
                ? 'float-positive bottom-0  text-green-700'
                : 'float-negative top-0 text-red-900',
              'absolute left-0 text-sm font-bold pointer-events-none  whitespace-nowrap',
            ]"
            >{{ coinDelta > 0 ? '+' : '' }}{{ coinDelta }}</span
          >
        </span>
      </Badge>
      <Badge variant="gem" size="large" class="min-w-14">
        <span class="relative">
          {{ displayGems }}
          <span
            v-if="gemDelta !== null"
            :key="'g' + gemDelta + Date.now()"
            :class="[
              gemDelta > 0
                ? 'float-positive bottom-0  text-green-700'
                : 'float-negative top-0 text-red-900',
              'absolute left-0 text-sm font-bold pointer-events-none whitespace-nowrap',
            ]"
            >{{ gemDelta > 0 ? '+' : '' }}{{ gemDelta }}</span
          >
        </span>
      </Badge>
    </div>
  </div>
</template>
