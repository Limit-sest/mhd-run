<script setup lang="ts">
  import { Button } from '@/components/ui/button';
  import { Input } from '@/components/ui/input';
  import { usePlayerStore, useShopStore } from '@/stores';
  import { computed, onMounted } from 'vue';
  import { storeToRefs } from 'pinia';
  import { Plus, Minus, Check, CheckCheck } from 'lucide-vue-next';

  const shopStore = useShopStore();
  const shop = storeToRefs(shopStore);
  const player = usePlayerStore();

  const handleShopItemCountChange = (itemIndex: number, event: Event) => {
    const target = event.target as HTMLInputElement;
    const newCount = parseInt(target.value, 10);
    if (!isNaN(newCount) && newCount >= 0) {
      shop.shoppingCart.value.transit[itemIndex] = newCount;
    }
  };

  const handlePay = (): void => {
    // Add owned powerups to player
    for (const itemIndex in shop.shoppingCart.value.powerup) {
      if (shop.shoppingCart.value.powerup[parseInt(itemIndex)]) {
        player.addOwnedPowerup(parseInt(itemIndex));
      }
    }

    player.removePowerup(shopStore.totalPowerups);
    player.removeCoins(shopStore.totalCoins);
    shopStore.initializeTransitCart();
    shopStore.initializePowerupCart();
  };

  const getShopItemCount = (itemIndex: number) => {
    return computed(() => shop.shoppingCart.value.transit[itemIndex] || 0);
  };

  onMounted(() => {
    shopStore.initializeTransitCart();
    shopStore.initializePowerupCart();
  });
</script>
<template>
  <div class="flex flex-col gap-3 m-4 justify-start">
    <!-- Transit Section -->
    <div v-if="shop.transit.value.length > 0">
      <h2 class="text-lg font-semibold mb-2">Doprava</h2>
      <div
        class="flex justify-between items-center gap-2 p-2 border-b"
        v-for="(item, index) in shop.transit.value"
        :key="`transit-${index}`"
      >
        <div class="flex flex-col">
          <span>{{ item.title }}</span>
          <span class="text-sm text-gray-500" v-if="item.price"
            >{{ item.price }} 🪙/min
          </span>
        </div>
        <div class="flex items-center gap-2">
          <Button
            @click="shopStore.removeShopItem(index)"
            variant="outline"
            :disabled="!getShopItemCount(index).value"
            size="icon"
          >
            <Minus class="w-4 h-4" />
          </Button>
          <Input
            type="number"
            @input="handleShopItemCountChange(index, $event)"
            v-model="shop.shoppingCart.value.transit[index]"
            min="0"
            class="w-16 tabular-nums"
          />
          <Button
            @click="shopStore.addShopItem(index)"
            variant="outline"
            size="icon"
          >
            <Plus class="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>

    <!-- Powerups Section -->
    <div v-if="shop.powerups.value.length > 0">
      <h2 class="text-lg font-semibold mb-2">Vylepšení</h2>
      <div
        class="flex justify-between items-center gap-2 p-2 border-b"
        v-for="(item, index) in shop.powerups.value"
        :key="`powerup-${index}`"
      >
        <div class="flex flex-col gap-0.5">
          <span>{{ item.title }}</span>
          <p class="text-sm text-gray-700">{{ item.description }}</p>
          <div class="flex gap-1">
            <span class="text-sm text-gray-500" v-if="item.price"
              >{{ item.price }} ⚡
            </span>
            <span
              class="text-sm text-gray-500"
              v-if="player.hasOwnedPowerup(index) && item.price"
            >
              •
            </span>
            <span
              class="text-sm text-gray-500"
              v-if="player.hasOwnedPowerup(index)"
            >
              Vlastněno
            </span>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <Button
            @click="shopStore.togglePowerupItem(index)"
            :variant="
              shop.shoppingCart.value.powerup[index] ? 'default' : 'outline'
            "
            :disabled="player.hasOwnedPowerup(index)"
            size="icon"
          >
            <Check
              v-if="shop.shoppingCart.value.powerup[index]"
              class="w-4 h-4"
            />
            <CheckCheck
              v-else-if="player.hasOwnedPowerup(index)"
              class="w-4 h-4"
            />
            <Plus v-else class="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>

    <div class="mt-auto">
      <Button
        @click="handlePay"
        :disabled="
          shopStore.totalCoins > player.coins ||
          (shopStore.totalCoins === 0 && shopStore.totalPowerups === 0) ||
          shopStore.totalPowerups > player.powerup
        "
        class="tabular-nums w-full"
      >
        Zaplatit
        {{ shopStore.totalCoins }}
        🪙
        {{ shopStore.totalPowerups }} ⚡
      </Button>
    </div>

    <span>{{ player.ownedPowerups }}</span>
    <span>{{ shop.powerups }}</span>
  </div>
</template>
