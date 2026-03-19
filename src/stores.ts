import { defineStore } from 'pinia';
import { getDistance } from './utils';
import type { Card, ShopItem, Location, Timer } from './types';

interface ShoppingCart {
  transit: { id: number; minutes: number };
  powerup: Record<number, boolean>;
  totalPowerups: number;
}

function reviveDates(obj: unknown): unknown {
  if (
    typeof obj === 'string' &&
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/.test(obj)
  ) {
    return new Date(obj);
  } else if (Array.isArray(obj)) {
    return obj.map(reviveDates);
  } else if (obj && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [key, reviveDates(value)])
    );
  }
  return obj;
}

const dateSerializer = {
  serialize: (value: unknown) => JSON.stringify(value),
  deserialize: (value: string) => reviveDates(JSON.parse(value)),
};

export const useAllCardsStore = defineStore('allCards', {
  state: () => ({
    cards: [] as Card[],
  }),
  actions: {
    setCards(cards: Card[]) {
      this.cards = cards;
    },
    getCardDetails(cardId: number): Card | undefined {
      return this.cards.find((card: Card) => card.id === cardId);
    },
    addTimestamp(cardId: number) {
      const card = this.getCardDetails(cardId);
      if (card) {
        card.timestamp = new Date();
      }
    },
    addTimerEnd(cardId: number, duration: number) {
      const card = this.getCardDetails(cardId);
      if (card) {
        card.timerEnd = new Date(card.timestamp.getTime() + duration * 60000);
      }
    },
  },
  persist: {
    serializer: dateSerializer,
  },
});

export const useTimersStore = defineStore('timersStore', {
  state: () => ({
    veto: {} as Timer,
    powerups: [] as Timer[],
    currentTime: new Date().getTime(),
  }),
  getters: {
    vetoTimeRemaining: (state) => {
      if (!state.veto.start || !state.veto.end) return null;

      const distance = state.veto.end.getTime() - state.currentTime;

      if (distance < 0) return null;

      const _second = 1000;
      const _minute = _second * 60;
      const _hour = _minute * 60;

      const minutes = Math.floor((distance % _hour) / _minute);
      const seconds = String(
        Math.floor((distance % _minute) / _second)
      ).padStart(2, '0');

      return `${minutes}m${seconds}s`;
    },
    vetoProgress: (state) => {
      if (!state.veto.start || !state.veto.end) return 0;

      const total = state.veto.end.getTime() - state.veto.start.getTime();
      const elapsed = state.currentTime - state.veto.start.getTime();

      if (elapsed < 0) return 0;
      if (elapsed >= total) return 100;

      return (elapsed / total) * 100;
    },
    isVetoActive: (state) => {
      if (!state.veto.start || !state.veto.end) return false;
      return state.currentTime < state.veto.end.getTime();
    },
    powerupTimeRemaining: (state) => (powerupId: number) => {
      const timer = state.powerups.find((t) => t.powerupId === powerupId);
      if (!timer || !timer.start || !timer.end) return null;

      const distance = timer.end.getTime() - state.currentTime;

      if (distance < 0) return null;

      const _second = 1000;
      const _minute = _second * 60;
      const _hour = _minute * 60;

      const minutes = Math.floor((distance % _hour) / _minute);
      const seconds = String(
        Math.floor((distance % _minute) / _second)
      ).padStart(2, '0');

      return `${minutes}m${seconds}s`;
    },
    powerupProgress: (state) => (powerupId: number) => {
      const timer = state.powerups.find((t) => t.powerupId === powerupId);
      if (!timer || !timer.start || !timer.end) return 0;

      const total = timer.end.getTime() - timer.start.getTime();
      const elapsed = state.currentTime - timer.start.getTime();

      if (elapsed < 0) return 0;
      if (elapsed >= total) return 100;

      return (elapsed / total) * 100;
    },
    isPowerupActive: (state) => (powerupId: number) => {
      const timer = state.powerups.find((t) => t.powerupId === powerupId);
      if (!timer || !timer.start || !timer.end) return false;
      return state.currentTime < timer.end.getTime();
    },
    activePowerups: (state) => {
      return state.powerups.filter(
        (timer) =>
          timer.start && timer.end && state.currentTime < timer.end.getTime()
      );
    },
  },
  actions: {
    set(
      type: 'veto' | 'powerup',
      duration: number,
      powerupId: number | null = null
    ): void {
      switch (type) {
        case 'veto':
          this.veto.start = new Date();
          this.veto.end = new Date(
            this.veto.start.getTime() + duration * 60000
          );
          return;
        case 'powerup': {
          let timer = {} as Timer;
          timer.start = new Date();
          timer.end = new Date(timer.start.getTime() + duration * 60000);
          timer.powerupId = powerupId;
          this.powerups.push(timer);
          return;
        }
      }
    },
    updateCurrentTime() {
      this.currentTime = new Date().getTime();
      this.cleanupExpiredTimers();
    },
    cleanupExpiredTimers() {
      this.powerups = this.powerups.filter(
        (timer) => timer.end && this.currentTime < timer.end.getTime()
      );

      // Clear expired veto timer
      if (this.veto.end && this.currentTime >= this.veto.end.getTime()) {
        this.veto = {} as Timer;
      }
    },
    startTimerUpdates() {
      // Update current time immediately on initialization
      this.updateCurrentTime();
      // Update every second
      setInterval(() => {
        this.updateCurrentTime();
      }, 1000);
    },
  },
  persist: {
    pick: ['veto', 'powerups'],
    serializer: dateSerializer,
  },
});

export const useHandCardsStore = defineStore('handCards', {
  state: () => ({
    cards: [] as number[],
  }),
  actions: {
    setCards(cards: number[]) {
      this.cards = cards;
    },
  },
  persist: true,
});

export const useCompletedCardsStore = defineStore('completedCards', {
  state: () => ({
    cards: [] as number[],
  }),
  actions: {
    setCards(cards: number[]) {
      this.cards = cards;
    },
  },
  persist: true,
});

export const useShuffeledCardsStore = defineStore('shuffeledCards', {
  state: () => ({
    cards: [] as number[],
  }),
  actions: {
    shuffleCards() {
      const allCardsStore = useAllCardsStore();
      const handCardsStore = useHandCardsStore();
      const completedCardsStore = useCompletedCardsStore();
      // Ensure allCardsStore.cards is populated before mapping
      const cardIdsToShuffle = allCardsStore.cards
        ? allCardsStore.cards.map((card: Card) => card.id)
        : [];

      for (let i = cardIdsToShuffle.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cardIdsToShuffle[i], cardIdsToShuffle[j]] = [
          cardIdsToShuffle[j],
          cardIdsToShuffle[i],
        ];
      }
      this.cards = cardIdsToShuffle;
      // Reset hand and completed cards
      handCardsStore.setCards([]);
      completedCardsStore.setCards([]);
    },
  },
  persist: true,
});

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

export const useLocationsStore = defineStore('locations', {
  state: () => ({
    currentLocation: undefined as Location | undefined,
    radiusSetting: { min: 4.5, max: 6 } as { min: number; max: number },
    allLocations: [] as Location[],
    latestGps: undefined as GeolocationPosition | undefined,
  }),
  actions: {
    drawLocation(gpsLat: number, gpsLon: number) {
      const gameSettings = useGameSettingsStore();
      const radiusMultiplier = gameSettings.radiusAffectedByMultiplier ? gameSettings.multiplier : 1;
      const minRadius = this.radiusSetting.min * radiusMultiplier;
      const maxRadius = this.radiusSetting.max * radiusMultiplier;

      const validLocations: Location[] = this.allLocations.filter(
        (location: Location) => {
          const distance = getDistance(
            gpsLat,
            gpsLon,
            location.latitude,
            location.longitude
          );
          return (
            distance >= minRadius &&
            distance <= maxRadius
          );
        }
      );

      if (validLocations.length > 0) {
        // If we found locations within the radius, pick one randomly
        this.currentLocation =
          validLocations[Math.floor(Math.random() * validLocations.length)];
      } else {
        // Fallback: find the location closest to the radius boundaries
        if (this.allLocations.length > 0) {
          let bestLocation = this.allLocations[0];
          let bestDistance = getDistance(
            gpsLat,
            gpsLon,
            bestLocation.latitude,
            bestLocation.longitude
          );
          let bestDistanceFromBoundary = Math.min(
            Math.abs(bestDistance - minRadius),
            Math.abs(bestDistance - maxRadius)
          );

          for (const location of this.allLocations) {
            const distance = getDistance(
              gpsLat,
              gpsLon,
              location.latitude,
              location.longitude
            );

            const distanceFromMinBoundary = Math.abs(
              distance - minRadius
            );
            const distanceFromMaxBoundary = Math.abs(
              distance - maxRadius
            );
            const distanceFromBoundary = Math.min(
              distanceFromMinBoundary,
              distanceFromMaxBoundary
            );

            if (distanceFromBoundary < bestDistanceFromBoundary) {
              bestDistanceFromBoundary = distanceFromBoundary;
              bestLocation = location;
            }
          }

          this.currentLocation = bestLocation;
        } else {
          this.currentLocation = undefined;
        }
      }
    },
    setAllLocations(locations: Location[]) {
      this.allLocations = locations;
    },
    resetLocation() {
      this.currentLocation = undefined;
    },
    setRadiusSetting(min: number, max: number) {
      this.radiusSetting = { min, max };
    },
    setLatestGps(gps: GeolocationPosition) {
      this.latestGps = gps;
    },
  },
  persist: {
    pick: ['radiusSetting', 'allLocations'],
  },
});

export const useFetchTimestamp = defineStore('fetchTimestamp', {
  state: () => ({
    cards: undefined,
  }),
});

export const useLanguageStore = defineStore('language', {
  state: () => ({
    lang: navigator.language.split('-')[0],
  }),
  persist: true,
});

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
