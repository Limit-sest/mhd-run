import { defineStore } from 'pinia';

export const usePlayerStore = defineStore('player', {
  state: () => ({
    coins: 70,
    gems: 0,
    ownedPowerups: [] as number[],
    doublePowerupCard: [] as number[],
    transferPowerupCard: [] as number[],
  }),
  actions: {
    setCoins(amount: number) {
      this.coins = amount;
    },
    setGems(amount: number) {
      this.gems = amount;
    },
    addCoins(amount: number) {
      this.coins += amount;
    },
    addGems(amount: number) {
      this.gems += amount;
    },
    removeCoins(amount: number) {
      this.coins = Math.max(0, this.coins - amount);
    },
    removeGems(amount: number) {
      this.gems = Math.max(0, this.gems - amount);
    },
    addOwnedPowerup(powerupId: number) {
      if (!this.ownedPowerups.includes(powerupId)) {
        this.ownedPowerups.push(powerupId);
      }
    },
    removeOwnedPowerup(powerupId: number) {
      this.ownedPowerups = this.ownedPowerups.filter((item) => {
        return item !== powerupId;
      });
    },
    hasOwnedPowerup(powerupId: number): boolean {
      return this.ownedPowerups.includes(powerupId);
    },
    resetOwnedPowerups() {
      this.ownedPowerups = [] as number[];
      this.doublePowerupCard = [] as number[];
      this.transferPowerupCard = [] as number[];
    },
    addDoublePowerupCard(card: number): void {
      this.doublePowerupCard.push(card);
    },
    addTransferPowerupCard(card: number): void {
      this.transferPowerupCard.push(card);
    },
  },
  persist: true,
});
