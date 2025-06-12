<script setup>
  import { BookCopy, Store, Settings } from 'lucide-vue-next';
  import { Button } from '@/components/ui/button';
  import { useRoute } from 'vue-router';

  const route = useRoute();
  console.log(route);
</script>

<template>
  <div
    class="w-full border-t border-gray-300 bg-white px-4 py-2 flex flex-nowrap items-center justify-evenly"
  >
    <RouterLink to="/" as-child>
      <Button size="icon" :variant="route.path === '/' ? 'secondary' : 'ghost'">
        <BookCopy class="text-gray-800" />
      </Button>
    </RouterLink>
    <RouterLink to="/shop" as-child>
      <Button
        size="icon"
        :variant="route.path === '/shop' ? 'secondary' : 'ghost'"
      >
        <Store class="text-gray-800" />
      </Button>
    </RouterLink>
    <RouterLink to="/settings" as-child>
      <Button
        size="icon"
        :variant="route.path === '/settings' ? 'secondary' : 'ghost'"
      >
        <Settings class="text-gray-800" />
      </Button>
    </RouterLink>
  </div>
</template>
