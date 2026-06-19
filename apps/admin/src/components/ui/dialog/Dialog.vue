<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
} from 'reka-ui';
import { X } from 'lucide-vue-next';
import { cn } from '@/lib/utils';

const props = defineProps<{
  open: boolean;
  title?: string;
  description?: string;
  class?: HTMLAttributes['class'];
}>();

const emit = defineEmits<{ (e: 'update:open', value: boolean): void }>();
</script>

<template>
  <DialogRoot :open="open" @update:open="emit('update:open', $event)">
    <DialogPortal>
      <DialogOverlay
        class="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
      />
      <DialogContent
        :class="
          cn(
            'bg-background fixed left-1/2 top-1/2 z-50 grid max-h-[90vh] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 overflow-y-auto rounded-lg border p-6 shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            props.class,
          )
        "
      >
        <div v-if="title || description" class="flex flex-col gap-1.5 pr-6">
          <DialogTitle v-if="title" class="text-lg font-semibold leading-none">
            {{ title }}
          </DialogTitle>
          <DialogDescription v-if="description" class="text-muted-foreground text-sm">
            {{ description }}
          </DialogDescription>
        </div>
        <slot />
        <DialogClose
          class="ring-offset-background focus:ring-ring absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2"
        >
          <X class="size-4" />
          <span class="sr-only">Close</span>
        </DialogClose>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
