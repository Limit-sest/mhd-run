<script lang="ts" setup>
  import { CircleDollarSign, Gem, Timer } from 'lucide-vue-next';
  import { cn } from '@/lib/utils';
  import { computed } from 'vue';

  interface Props {
    variant: 'coin' | 'gem' | 'timer';
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

  const variants = {
    coin: 'bg-yellow-100 text-yellow-950',
    gem: 'bg-sky-100 text-sky-950',
    timer: 'bg-slate-100 text-slate-950',
  };
</script>
<template>
  <div
    :class="
      cn(
        'flex items-center rounded-full font-bold w-min',
        variants[variant],
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
