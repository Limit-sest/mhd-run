import { ref } from 'vue';
import { usePlayerStore, useShopStore, useTimersStore, useGameSettingsStore } from '@/stores';
import { share } from '@/utils';
import { PERSISTENT_POWERUPS, DIALOG_POWERUPS } from '@mhd/shared';

export function useShopCheckout() {
  const shopStore = useShopStore();
  const player = usePlayerStore();
  const timers = useTimersStore();
  const gameSettings = useGameSettingsStore();

  const showDialogPowerupAlert = ref(false);
  const ownedDialogPowerups = ref<number[]>([]);
  const pendingTimers = ref<{ id: number; timer: number }[]>([]);

  function handlePay(): void {
    let hasDialogPowerups = false;
    pendingTimers.value = [];

    for (const itemIndex in shopStore.shoppingCart.powerup) {
      if (shopStore.shoppingCart.powerup[parseInt(itemIndex)]) {
        const powerup = shopStore.powerups.find(
          (p) => p.id == parseInt(itemIndex)
        );
        if (DIALOG_POWERUPS.includes(powerup.id as typeof DIALOG_POWERUPS[number])) {
          hasDialogPowerups = true;
          ownedDialogPowerups.value.push(powerup.id);
        }

        if (powerup.timer) {
          pendingTimers.value.push({
            id: powerup.id,
            timer: powerup.timer * gameSettings.multiplier,
          });
        }
      }
    }

    if (hasDialogPowerups) {
      showDialogPowerupAlert.value = true;
    } else {
      pendingTimers.value.forEach(({ id, timer }) => {
        timers.set('powerup', timer, id);
      });
    }

    for (const itemIndex in shopStore.shoppingCart.powerup) {
      if (shopStore.shoppingCart.powerup[parseInt(itemIndex)]) {
        if (PERSISTENT_POWERUPS.includes(parseInt(itemIndex) as typeof PERSISTENT_POWERUPS[number])) {
          player.addOwnedPowerup(parseInt(itemIndex));
        }
      }
    }

    player.removeGems(shopStore.totalGems);
    player.removeCoins(shopStore.totalCoins);
    shopStore.initializeTransitCart();
    shopStore.initializePowerupCart();
  }

  async function handleShare(): Promise<void> {
    let shareText = '';
    ownedDialogPowerups.value.forEach((powerupId) => {
      shareText += shopStore.powerups.find(
        (powerup) => powerup.id == powerupId
      ).shareDescription;
      shareText += '\n';
    });

    await share(shareText);

    pendingTimers.value.forEach(({ id, timer }) => {
      timers.set('powerup', timer, id);
    });

    showDialogPowerupAlert.value = false;
    ownedDialogPowerups.value = [];
    pendingTimers.value = [];
  }

  return {
    showDialogPowerupAlert,
    ownedDialogPowerups,
    handlePay,
    handleShare,
  };
}
