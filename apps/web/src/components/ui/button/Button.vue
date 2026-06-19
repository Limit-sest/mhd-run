<script setup lang="ts">
  import type { HTMLAttributes } from 'vue';
  import { Primitive, type PrimitiveProps } from 'reka-ui';
  import { cn } from '@/lib/utils';
  import { type ButtonVariants, buttonVariants } from '.';

  interface Props extends PrimitiveProps {
    variant?: ButtonVariants['variant'];
    size?: ButtonVariants['size'];
    class?: HTMLAttributes['class'];
  }

  const props = withDefaults(defineProps<Props>(), {
    as: 'button',
  });
</script>

<template>
  <Primitive
    data-slot="button"
    :as="as"
    :as-child="asChild"
    :class="
      cn(
        buttonVariants({ variant, size }),
        props.class,
        'transition-transform duration-150 ease-in-out active:scale-95'
      )
    "
  >
    <slot />
  </Primitive>
</template>
