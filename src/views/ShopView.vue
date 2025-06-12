<script setup>
  import { Button } from '@/components/ui/button';
  import { Input } from '@/components/ui/input';
  import { useShopStore } from '@/stores';
  import { ref, computed } from 'vue';

  const shop = useShopStore();
  const shoppingCart = ref({
    transit: {},
    powerup: {},
    totalCoins: 0,
    totalPowerups: 0,
  });

  const addTransitItemToCart = (itemIndex) => {
    if (shoppingCart.value.transit[itemIndex]) {
      shoppingCart.value.transit[itemIndex]++;
    } else {
      shoppingCart.value.transit[itemIndex] = 1;
    }
  };

  const removeTransitItemFromCart = (itemIndex) => {
    if (
      shoppingCart.value.transit[itemIndex] &&
      shoppingCart.value.transit[itemIndex] > 0
    ) {
      shoppingCart.value.transit[itemIndex]--;
      if (shoppingCart.value.transit[itemIndex] === 0) {
        delete shoppingCart.value.transit[itemIndex]; // Remove if count is zero
      }
    }
  };

  const handleTransitItemCountChange = (itemIndex, event) => {
    const newCount = parseInt(event.target.value, 10);
    if (!isNaN(newCount) && newCount > 0) {
      shoppingCart.value.transit[itemIndex] = newCount;
    } else {
      delete shoppingCart.value.transit[itemIndex];
    }
  };

  const getTransitItemCount = (itemIndex) => {
    return computed(() => shoppingCart.value.transit[itemIndex] || 0);
  };
</script>
<template>
  <div class="flex flex-col gap-3 m-4">
    <div
      class="flex justify-between items-center gap-2 p-2 border-b"
      v-for="(item, index) in shop.transit"
      :key="index"
    >
      <div class="flex flex-col">
        <span>{{ item.name }}</span>
        <span class="text-sm text-gray-500" v-if="item.price"
          >Cena: {{ item.price }} mincí</span
        >
      </div>
      <div class="flex items-center gap-2">
        <Button
          @click="removeTransitItemFromCart(index)"
          variant="outline"
          :disabled="!getTransitItemCount(index).value"
        >
          -
        </Button>
        <Input
          type="number"
          :value="getTransitItemCount(index).value"
          @input="handleTransitItemCountChange(index, $event)"
          min="0"
          class="w-16 tabular-nums"
        />
        <Button @click="addTransitItemToCart(index)" variant="outline">
          +
        </Button>
      </div>
    </div>
  </div>
</template>
