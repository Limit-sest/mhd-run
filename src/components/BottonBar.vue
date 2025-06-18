<script setup>
  import { BookCopy, Store, Settings } from 'lucide-vue-next';
  import { Button } from '@/components/ui/button';
  import { useRoute } from 'vue-router';

  const route = useRoute();
</script>

<template>
  <div
    class="w-full border-t border-gray-300 bg-white px-4 py-3 flex flex-nowrap items-center justify-evenly"
  >
    <RouterLink to="/" class="flex-1 flex">
      <div class="w-full flex items-center justify-center">
        <Button
          size="icon"
          :variant="route.path === '/' ? 'secondary' : 'ghost'"
        >
          <BookCopy class="text-gray-800" />
        </Button>
      </div>
    </RouterLink>
    <RouterLink to="/shop" class="flex-1 flex">
      <div class="w-full flex items-center justify-center">
        <Button
          size="icon"
          :variant="route.path === '/shop' ? 'secondary' : 'ghost'"
        >
          <Store class="text-gray-800" />
        </Button>
      </div>
    </RouterLink>
    <RouterLink to="/settings" class="flex-1 flex">
      <div class="w-full flex items-center justify-center">
        <Button
          size="icon"
          :variant="route.path === '/settings' ? 'secondary' : 'ghost'"
        >
          <Settings class="text-gray-800" />
        </Button>
      </div>
    </RouterLink>
  </div>
</template>
