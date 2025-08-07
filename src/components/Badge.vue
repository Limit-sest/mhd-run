<script lang="ts" setup>
  import { CircleDollarSign, Gem, Timer, Ban } from 'lucide-vue-next';
  import { cn } from '@/lib/utils';
  import { computed } from 'vue';

  interface Props {
    variant?: 'coin' | 'gem' | 'timer' | 'veto';
    size?: 'small' | 'large';
    class?: string;
  }
  const props = defineProps<Props>();

  const icon = computed(() => {
    switch (props.variant) {
      case 'coin':
        return CircleDollarSign;
      case 'gem':
        return Gem;
      case 'timer':
        return Timer;
      case 'veto':
        return Ban;
    }
  });

  const size = computed(() => {
    switch (props.size) {
      case 'large':
        return 'px-2 gap-1.5 text-lg';
      default:
        return 'px-1.5 gap-1';
    }
  });

  const variants = computed(() => {
    switch (props.variant) {
      case 'coin':
        return 'bg-yellow-100 text-yellow-950';
      case 'gem':
        return 'bg-sky-100 text-sky-950';
      case 'timer':
        return 'bg-slate-100 text-slate-950';
      case 'veto':
        return 'bg-red-100 text-red-950';
      default:
        return 'bg-slate-100 text-slate-950';
    }
  });
</script>
<template>
  <div
    :class="
      cn(
        'flex items-center rounded-full font-bold tabular-nums w-min',
        variants,
        size,
        props.class
      )
    "
  >
    <component
      :is="icon"
      :class="props.size === 'large' ? 'h-5 w-5' : 'h-4 w-4'"
    />
    <span class="flex gap-0.5"><slot></slot></span>
  </div>
</template>
