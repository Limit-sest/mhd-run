<script setup lang="ts">
  import { Button } from '@/components/ui/button';
  import { Input } from '@/components/ui/input';
  import { usePlayerStore, useShopStore, useTimersStore } from '@/stores';
  import { computed, onMounted, ref } from 'vue';
  import { storeToRefs } from 'pinia';
  import { Plus, Minus, Check, CheckCheck, Share2 } from 'lucide-vue-next';
  import Badge from '@/components/Badge.vue';
  import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
  } from '@/components/ui/alert-dialog';
  import { share } from '@/utils';

  const shopStore = useShopStore();
  const shop = storeToRefs(shopStore);
  const player = usePlayerStore();
  const timers = useTimersStore();

  const showDialogPowerupAlert = ref(false);
  const ownedDialogPowerups = ref([]);
  const pendingTimers = ref([]);

  const handleShopItemCountChange = (itemIndex: number, event: Event) => {
    const target = event.target as HTMLInputElement;
    const newCount = parseInt(target.value, 10);
    if (!isNaN(newCount) && newCount >= 0) {
      shop.shoppingCart.value.transit[itemIndex] = newCount;
    }
  };

  const handlePay = (): void => {
    const persistentPowerups = [0, 2];
    const dialogPowerups = [1, 3, 4];

    let hasDialogPowerups = false;
    pendingTimers.value = [];

    for (const itemIndex in shop.shoppingCart.value.powerup) {
      if (shop.shoppingCart.value.powerup[parseInt(itemIndex)]) {
        let powerup = shopStore.powerups.find(
          (powerup) => powerup.id == parseInt(itemIndex)
        );
        if (dialogPowerups.includes(powerup.id)) {
          hasDialogPowerups = true;
          ownedDialogPowerups.value.push(powerup.id);
        }

        if (powerup.timer) {
          pendingTimers.value.push({ id: powerup.id, timer: powerup.timer });
        }
      }
    }

    if (hasDialogPowerups) {
      showDialogPowerupAlert.value = true;
    } else {
      // Set timers immediately if no dialog powerups
      pendingTimers.value.forEach(({ id, timer }) => {
        timers.set('powerup', timer, id);
      });
    }

    for (const itemIndex in shop.shoppingCart.value.powerup) {
      if (shop.shoppingCart.value.powerup[parseInt(itemIndex)]) {
        if (persistentPowerups.includes(parseInt(itemIndex))) {
          player.addOwnedPowerup(parseInt(itemIndex));
        }
      }
    }

    player.removePowerup(shopStore.totalPowerups);
    player.removeCoins(shopStore.totalCoins);
    shopStore.initializeTransitCart();
    shopStore.initializePowerupCart();
  };

  async function handleShare() {
    let shareText: string = '';
    ownedDialogPowerups.value.forEach((powerupId) => {
      shareText += shopStore.powerups.find(
        (powerup) => powerup.id == powerupId
      ).shareDescription;
      shareText += '\n';
    });

    console.log(shareText);

    await share(shareText);

    // Set timers after sharing is complete
    pendingTimers.value.forEach(({ id, timer }) => {
      timers.set('powerup', timer, id);
    });

    showDialogPowerupAlert.value = false;
    ownedDialogPowerups.value = [];
    pendingTimers.value = [];
  }

  const getShopItemCount = (itemIndex: number) => {
    return computed(() => shop.shoppingCart.value.transit[itemIndex] || 0);
  };

  onMounted(() => {
    shopStore.initializeTransitCart();
    shopStore.initializePowerupCart();
    timers.startTimerUpdates();
  });
</script>
<template>
  <div class="flex flex-col gap-3 m-4 mb-0 justify-start relative">
    <div class="w-full h-full flex-1 overflow-y-scroll">
      <!-- Transit Section -->
      <div v-if="shop.transit.value.length > 0" class="mb-4">
        <h2 class="text-lg font-semibold">{{ $t('shop.transit') }}</h2>
        <div
          class="flex justify-between items-center p-2 border-b last:border-none"
          v-for="(item, index) in shop.transit.value"
          :key="`transit-${index}`"
        >
          <div class="flex flex-col gap-1">
            <span class="font-medium">{{ item.title }}</span>
            <Badge v-if="item.price" variant="coin"
              >{{ item.price }}/min
            </Badge>
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
      <div v-if="shop.powerups.value.length > 0" class="mb-20">
        <h2 class="text-lg font-semibold">{{ $t('shop.powerups') }}</h2>
        <div
          class="flex justify-between items-center gap-2 p-2 border-b last:border-none"
          v-for="item in shop.powerups.value"
          :key="item.id"
        >
          <div class="flex flex-col gap-2">
            <div class="space-y-0.5">
              <span class="font-medium">{{ item.title }}</span>
              <p class="text-sm text-gray-700">{{ item.description }}</p>
            </div>

            <div class="flex gap-1">
              <Badge variant="gem" v-if="item.price">{{ item.price }}</Badge>
              <Badge variant="timer" v-if="timers.isPowerupActive(item.id)">{{
                timers.powerupTimeRemaining(item.id)
              }}</Badge>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <Button
              @click="shopStore.togglePowerupItem(item.id)"
              :variant="
                shop.shoppingCart.value.powerup[item.id] ? 'default' : 'outline'
              "
              :disabled="
                player.hasOwnedPowerup(item.id) ||
                timers.isPowerupActive(item.id)
              "
              size="icon"
            >
              <Check
                v-if="shop.shoppingCart.value.powerup[item.id]"
                class="w-4 h-4"
              />
              <CheckCheck
                v-else-if="
                  player.hasOwnedPowerup(item.id) ||
                  timers.isPowerupActive(item.id)
                "
                class="w-4 h-4"
              />
              <Plus v-else class="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>

    <div class="py-4 z-10 absolute bottom-0 w-full">
      <div class="bg-white">
        <Button
          @click="handlePay"
          :disabled="
            shopStore.totalCoins > player.coins ||
            (shopStore.totalCoins === 0 && shopStore.totalPowerups === 0) ||
            shopStore.totalPowerups > player.powerup
          "
          class="tabular-nums w-full"
          v-if="!timers.isVetoActive"
        >
          {{ $t('shop.pay') }}
          <Badge variant="coin" v-if="shopStore.totalCoins">{{
            shopStore.totalCoins
          }}</Badge>

          <Badge variant="gem" v-if="shopStore.totalPowerups">{{
            shopStore.totalPowerups
          }}</Badge>
        </Button>
        <Button class="w-full bg-gray-900/50 pointer-events-none" v-else
          ><Badge variant="veto">{{ timers.vetoTimeRemaining }}</Badge>
        </Button>
      </div>
    </div>

    <AlertDialog v-model:open="showDialogPowerupAlert">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{{
            $t('shop.powerups-share.title')
          }}</AlertDialogTitle>
        </AlertDialogHeader>
        <div
          v-for="powerupId in ownedDialogPowerups"
          key="powerupId"
          class="flex justify-between items-center gap-2 p-2"
        >
          <div class="space-y-0.5">
            <span class="font-medium">{{
              shopStore.powerups.find((powerup) => powerup.id == powerupId)
                .title
            }}</span>
            <p class="text-sm text-gray-700">
              {{
                shopStore.powerups.find((powerup) => powerup.id == powerupId)
                  .description
              }}
            </p>
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogAction @click="handleShare"
            ><Share2 class="w-4 h-4 mr-1" />
            {{ $t('shop.powerups-share.share') }}</AlertDialogAction
          >
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>
