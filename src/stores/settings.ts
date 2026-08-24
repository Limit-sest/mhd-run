import { defineStore } from 'pinia';

export const useGameSettingsStore = defineStore('gameSettings', {
  state: () => ({
    multiplier: 1.0,
    baseLeadTime: 5,
    baseStartingCoins: 70,
    radiusAffectedByMultiplier: true,
  }),
  getters: {
    leadTime: (state) => state.baseLeadTime * state.multiplier,
    startingCoins: (state) =>
      Math.round(state.baseStartingCoins * state.multiplier),
    vetoDuration(): number {
      return this.leadTime * 0.8;
    },
  },
  actions: {
    setMultiplier(value: number) {
      this.multiplier = Math.round(value * 10) / 10;
    },
    setBaseLeadTime(value: number) {
      this.baseLeadTime = value;
    },
    setBaseStartingCoins(value: number) {
      this.baseStartingCoins = value;
    },
    setRadiusAffectedByMultiplier(value: boolean) {
      this.radiusAffectedByMultiplier = value;
    },
  },
  persist: true,
});
