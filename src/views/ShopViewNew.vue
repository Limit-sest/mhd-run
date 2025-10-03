<script setup lang="ts">
  import { Button } from '@/components/ui/button';
  import { cn } from '@/lib/utils';
  import { usePlayerStore, useShopStore, useTimersStore } from '@/stores';
  import { computed, onMounted, ref } from 'vue';
  import { storeToRefs } from 'pinia';
  import {
    Plus,
    Minus,
    Check,
    CheckCheck,
    Share2,
    BadgeDollarSign,
    MapPinned,
    ArrowLeftRight,
    MapPinOff,
    Snowflake,
    TrainFrontTunnel,
    TramFront,
    Ship,
    TrainFront,
    Bike,
  } from 'lucide-vue-next';
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
  import { Slider } from '@/components/ui/slider';

  const iconComponents = {
    Plus,
    Minus,
    Check,
    CheckCheck,
    Share2,
    BadgeDollarSign,
    MapPinned,
    ArrowLeftRight,
    MapPinOff,
    Snowflake,
    TrainFrontTunnel,
    TramFront,
    Ship,
    TrainFront,
    Bike,
  };

  const shopStore = useShopStore();
  const shop = storeToRefs(shopStore);
  const player = usePlayerStore();
  const timers = useTimersStore();

  const showDialogPowerupAlert = ref(false);
  const ownedDialogPowerups = ref([]);
  const pendingTimers = ref([]);
  const selectedTransit = ref();
  const slider = ref([5]);

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
      <div v-if="shop.transit.value.length > 0" class="mb-8">
        <h2 class="text-xl font-semibold mb-2">{{ $t('shop.transit') }}</h2>
        <div class="grid grid-cols-2 gap-3">
          <span>{{ selectedTransit }}</span>
          <div
            :class="
              cn(
                'flex justify-between items-center py-6 px-5 border rounded-md transition-transform duration-150 ease-in-out active:scale-95 cursor-pointer',
                selectedTransit === item.id
                  ? 'bg-gray-900 text-gray-50 scale-95'
                  : ''
              )
            "
            v-for="(item, index) in shop.transit.value"
            :key="item.title"
            @click="
              () => {
                if (selectedTransit === item.id) {
                  selectedTransit = null;
                } else {
                  selectedTransit = item.id;
                }
              }
            "
          >
            <component
              :is="iconComponents[item.icon]"
              class="w-7 h-7 text-gray-700"
            />
            <div class="flex flex-col gap-1 text-right">
              <span class="font-semibold">{{ item.title }}</span>
              <Badge v-if="item.price" variant="coin"
                >{{ item.price }}/min
              </Badge>
            </div>
          </div>
        </div>
        <div>
          <span>{{ slider }}</span>
          <Slider
            :model-value="slider"
            :max="30"
            :min="1"
            :step="1"
            @update:model-value="(value) => (slider = value)"
          />
        </div>
      </div>

      <!-- Powerups Section -->
      <div v-if="shop.powerups.value.length > 0" class="mb-20">
        <h2 class="text-xl font-semibold mb-2">{{ $t('shop.powerups') }}</h2>
        <div class="grid grid-cols-2 gap-3">
          <div
            :class="
              cn(
                'flex justify-between items-center py-6 px-5 border rounded-md transition-transform duration-150 ease-in-out active:scale-95 cursor-pointer',
                shop.shoppingCart.value.powerup[item.id]
                  ? 'bg-gray-900 text-gray-50 scale-95'
                  : '',
                player.hasOwnedPowerup(item.id) ||
                  timers.isPowerupActive(item.id)
                  ? 'opacity-50 active:scale-100'
                  : ''
              )
            "
            v-for="(item, index) in shop.powerups.value"
            :key="item.title"
            @click="
              if (
                !(
                  player.hasOwnedPowerup(item.id) ||
                  timers.isPowerupActive(item.id)
                )
              )
                shopStore.togglePowerupItem(item.id);
            "
          >
            <component
              :is="iconComponents[item.icon]"
              :class="
                cn(
                  'w-7 h-7 flex-shrink-0',
                  shop.shoppingCart.value.powerup[item.id]
                    ? 'text-gray-200'
                    : 'text-gray-700'
                )
              "
            />
            <div class="flex flex-col gap-1 text-right items-end">
              <span class="font-semibold">{{ item.title }}</span>
              <div class="flex flex-col items-end gap-1">
                <Badge variant="gem" v-if="item.price">{{ item.price }}</Badge>
                <Badge variant="timer" v-if="timers.isPowerupActive(item.id)">{{
                  timers.powerupTimeRemaining(item.id)
                }}</Badge>
              </div>
            </div>
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
