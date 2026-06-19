import { defineStore } from 'pinia';
import type { ShopItem } from '@mhd/shared';
import { useGameSettingsStore } from './settings';

export interface ShoppingCart {
  transit: { id: number; minutes: number };
  powerup: Record<number, boolean>;
  totalPowerups: number;
}

export const useShopStore = defineStore('shop', {
  state: () => ({
    transit: [] as ShopItem[],
    powerups: [] as ShopItem[],
    shoppingCart: {
      transit: { id: 0, minutes: 0 },
      powerup: {} as Record<number, boolean>,
      totalPowerups: 0,
    } as ShoppingCart,
  }),
  getters: {
    totalCoins: (state) => {
      if (!state.shoppingCart.transit.id) return 0;
      const price = state.transit.find(
        (i) => i.id === state.shoppingCart.transit.id
      )?.price;
      const gameSettings = useGameSettingsStore();
      return Math.round(state.shoppingCart.transit.minutes * (price / gameSettings.multiplier));
    },
    totalGems: (state) => {
      let sum = 0;
      for (const itemIndex in state.shoppingCart.powerup) {
        const isSelected = state.shoppingCart.powerup[parseInt(itemIndex)];
        if (isSelected) {
          const price = state.powerups[parseInt(itemIndex)]?.price || 0;
          sum += price;
        }
      }
      return sum;
    },
  },
  actions: {
    setTransit(value: ShopItem[]) {
      this.transit = value;
    },
    setPowerups(value: ShopItem[]) {
      this.powerups = value;
    },
    initializeTransitCart() {
      this.transit.forEach((_: ShopItem, index: number) => {
        this.shoppingCart.transit[index] = 0;
      });
    },
    initializePowerupCart() {
      this.powerups.forEach((_: ShopItem, index: number) => {
        this.shoppingCart.powerup[index] = false;
      });
    },
    setTransitCount(id: number, count: number) {
      this.shoppingCart.transit = { id: id, minutes: count };
    },
    togglePowerupItem(itemIndex: number) {
      this.shoppingCart.powerup[itemIndex] =
        !this.shoppingCart.powerup[itemIndex];
    },
  },
  persist: {
    pick: ['transit', 'powerups'],
  },
});
