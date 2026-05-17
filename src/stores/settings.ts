import { defineStore } from 'pinia';

export const useGameSettingsStore = defineStore('gameSettings', {
  state: () => ({
    multiplier: 1.0,
    baseVetoDuration: 4,
    radiusAffectedByMultiplier: true,
  }),
  getters: {
    vetoDuration: (state) => state.baseVetoDuration * state.multiplier,
  },
  actions: {
    setMultiplier(value: number) {
      this.multiplier = Math.round(value * 10) / 10;
    },
    setBaseVetoDuration(value: number) {
      this.baseVetoDuration = value;
    },
    setRadiusAffectedByMultiplier(value: boolean) {
      this.radiusAffectedByMultiplier = value;
    },
  },
  persist: true,
});
