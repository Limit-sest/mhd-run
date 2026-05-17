import { defineStore } from 'pinia';

export const useGameSettingsStore = defineStore('gameSettings', {
  state: () => ({
    multiplier: 1.0,
    baseLeadTime: 5,
    radiusAffectedByMultiplier: true,
  }),
  getters: {
    leadTime: (state) => state.baseLeadTime * Math.sqrt(state.multiplier),
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
    setRadiusAffectedByMultiplier(value: boolean) {
      this.radiusAffectedByMultiplier = value;
    },
  },
  persist: true,
});
