<script setup>
  import { Button } from '@/components/ui/button';
  import { Input } from '@/components/ui/input';
  import { usePlayerStore, useShopStore } from '@/stores';
  import { computed, onMounted } from 'vue';
  import { storeToRefs } from 'pinia';

  const shopStore = useShopStore();
  const shop = storeToRefs(shopStore);
  const player = usePlayerStore();

  const handleShopItemCountChange = (itemIndex, event) => {
    const newCount = parseInt(event.target.value, 10);
    if (!isNaN(newCount) && newCount >= 0) {
      shop.shoppingCart.value.transit[itemIndex] = newCount;
    }
  };
  const handlePay = () => {
    player.removeCoins(shop.shoppingCart.value.totalCoins);
    shopStore.initializeTransitCart();
  };

  const getShopItemCount = (itemIndex) => {
    return computed(() => shop.shoppingCart.value.transit[itemIndex] || 0);
  };

  onMounted(() => {
    shopStore.initializeTransitCart();
  });
</script>
<template>
  <div class="flex flex-col gap-3 m-4 justify-start">
    <div
      class="flex justify-between items-center gap-2 p-2 border-b"
      v-for="(item, index) in shop.transit.value"
      :key="index"
    >
      <div class="flex flex-col">
        <span>{{ item.name }}</span>
        <span class="text-sm text-gray-500" v-if="item.price"
          >Cena: {{ item.price }} 🪙
        </span>
      </div>
      <div class="flex items-center gap-2">
        <Button
          @click="shopStore.removeShopItem(index)"
          variant="outline"
          :disabled="!getShopItemCount(index).value"
        >
          -
        </Button>
        <Input
          type="number"
          @input="handleShopItemCountChange(index, $event)"
          v-model="shop.shoppingCart.value.transit[index]"
          min="0"
          class="w-16 tabular-nums"
        />
        <Button @click="shopStore.addShopItem(index)" variant="outline">
          +
        </Button>
      </div>
    </div>
    <div class="mt-auto">
      <Button
        @click="handlePay"
        :disabled="shop.shoppingCart.value.totalCoins > player.coins"
        class="tabular-nums w-full"
      >
        Zaplatit
        {{ shop.shoppingCart.value.totalCoins }}
        🪙
      </Button>
    </div>
  </div>
</template>
