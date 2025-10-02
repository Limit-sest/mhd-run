import { defineStore } from 'pinia';
import type { Pinia } from 'pinia';
import { getFromLocalStorage, saveToLocalStorage, getDistance } from './utils';
import type { Card, ShopItem, Location, Timer } from './types';

interface ShoppingCart {
  transit: Record<number, number>;
  powerup: Record<number, boolean>;
  totalPowerups: number;
}

export const useAllCardsStore = defineStore('allCards', {
  state: () => ({
    cards: getFromLocalStorage('allCards_cards') || ([] as Card[]),
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
});

export const useTimersStore = defineStore('timersStore', {
  state: () => {
    const savedVeto = getFromLocalStorage('timersStore_veto') as Timer;
    const savedPowerups = getFromLocalStorage(
      'timersStore_powerups'
    ) as Timer[];

    return {
      veto:
        savedVeto && savedVeto.start && savedVeto.end
          ? ({
              start: new Date(savedVeto.start),
              end: new Date(savedVeto.end),
            } as Timer)
          : ({} as Timer),
      powerups: savedPowerups
        ? savedPowerups.map((p) => ({
            ...p,
            start: p.start ? new Date(p.start) : undefined,
            end: p.end ? new Date(p.end) : undefined,
          }))
        : ([] as Timer[]),
      currentTime: new Date().getTime(),
    };
  },
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
});

export const useHandCardsStore = defineStore('handCards', {
  state: () => ({
    cards: getFromLocalStorage('handCards_cards') || ([] as string[]),
  }),
  actions: {
    setCards(cards: string[]) {
      this.cards = cards;
    },
  },
});

export const useCompletedCardsStore = defineStore('completedCards', {
  state: () => ({
    cards: getFromLocalStorage('completedCards_cards') || ([] as string[]),
  }),
  actions: {
    setCards(cards: string[]) {
      this.cards = cards;
    },
  },
});

export const useShuffeledCardsStore = defineStore('shuffeledCards', {
  state: () => ({
    cards: getFromLocalStorage('shuffeledCards_cards') || ([] as string[]),
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
});

export const usePlayerStore = defineStore('player', {
  state: () => ({
    coins: getFromLocalStorage('player_coins') || 70,
    powerup: getFromLocalStorage('player_powerup') || 0,
    ownedPowerups:
      getFromLocalStorage('player_ownedPowerups') || ([] as number[]),
    doublePowerupCard:
      getFromLocalStorage('player_doublePowerupCard') || ([] as string[]),
    transferPowerupCard:
      getFromLocalStorage('player_transferPowerupCard') || ([] as string[]),
  }),
  actions: {
    setCoins(coins: number) {
      this.coins = coins;
    },
    setPowerup(powerup: number) {
      this.powerup = powerup;
    },
    addCoins(amount: number) {
      this.coins += amount;
    },
    addPowerup(amount: number) {
      this.powerup += amount;
    },
    removeCoins(amount: number) {
      this.coins = Math.max(0, this.coins - amount);
    },
    removePowerup(amount: number) {
      this.powerup = Math.max(0, this.powerup - amount);
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
      this.doublePowerupCard = [] as string[];
      this.transferPowerupCard = [] as string[];
    },
    addDoublePowerupCard(card: string): void {
      this.doublePowerupCard.push(card);
    },
    addTransferPowerupCard(card: string): void {
      this.transferPowerupCard.push(card);
    },
  },
});

export const useShopStore = defineStore('shop', {
  state: () => ({
    transit:
      (getFromLocalStorage('shop_transit') as ShopItem[]) || ([] as ShopItem[]),
    powerups:
      (getFromLocalStorage('shop_powerups') as ShopItem[]) ||
      ([] as ShopItem[]),
    shoppingCart: {
      transit: {} as Record<number, number>,
      powerup: {} as Record<number, boolean>,
    } as ShoppingCart,
  }),
  getters: {
    totalCoins: (state) => {
      let sum = 0;
      // Transit items (quantity-based)
      for (const itemIndex in state.shoppingCart.transit) {
        const quantity = state.shoppingCart.transit[parseInt(itemIndex)];
        const price = state.transit[parseInt(itemIndex)]?.price || 0;
        sum += quantity * price;
      }
      return sum;
    },
    totalPowerups: (state) => {
      let sum = 0;
      // Powerup items (boolean-based)
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
    addShopItem(itemIndex: number) {
      const currentCount = this.shoppingCart.transit[itemIndex] || 0;
      this.shoppingCart.transit[itemIndex] = currentCount + 1;
    },
    removeShopItem(itemIndex: number) {
      const currentCount = this.shoppingCart.transit[itemIndex] || 0;
      if (currentCount > 0) {
        this.shoppingCart.transit[itemIndex] = currentCount - 1;
      }
    },
    togglePowerupItem(itemIndex: number) {
      this.shoppingCart.powerup[itemIndex] =
        !this.shoppingCart.powerup[itemIndex];
    },
  },
});

export const useLocationsStore = defineStore('locations', {
  state: () => ({
    currentLocation: undefined as Location | undefined,
    radiusSetting:
      (getFromLocalStorage('location_radiusSetting') as {
        min: number;
        max: number;
      }) || ({ min: 4.5, max: 6 } as { min: number; max: number }),
    allLocations:
      getFromLocalStorage('location_allLocations') || ([] as Location[]),
    latestGps: undefined as GeolocationPosition | undefined,
  }),
  actions: {
    drawLocation(gpsLat: number, gpsLon: number) {
      const validLocations: Location[] = this.allLocations.filter(
        (location: Location) => {
          const distance = getDistance(
            gpsLat,
            gpsLon,
            location.latitude,
            location.longitude
          );
          return (
            distance >= this.radiusSetting.min &&
            distance <= this.radiusSetting.max
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
            Math.abs(bestDistance - this.radiusSetting.min),
            Math.abs(bestDistance - this.radiusSetting.max)
          );

          for (const location of this.allLocations) {
            const distance = getDistance(
              gpsLat,
              gpsLon,
              location.latitude,
              location.longitude
            );

            const distanceFromMinBoundary = Math.abs(
              distance - this.radiusSetting.min
            );
            const distanceFromMaxBoundary = Math.abs(
              distance - this.radiusSetting.max
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
      saveToLocalStorage('location_allLocations', locations);
    },
    resetLocation() {
      this.currentLocation = undefined;
    },
    setRadiusSetting(min: number, max: number) {
      this.radiusSetting = { min, max };
      saveToLocalStorage('location_radiusSetting', this.radiusSetting);
    },
    setLatestGps(gps: GeolocationPosition) {
      this.latestGps = gps;
    },
  },
});

export const useFetchTimestamp = defineStore('fetchTimestamp', {
  state: () => ({
    cards: undefined,
  }),
});

export const useLanguageStore = defineStore('language', {
  state: () => ({
    lang:
      getFromLocalStorage('language_lang') || navigator.language.split('-')[0],
  }),
});

// Function to setup persistence for all stores
export function setupStorePersistence(piniaInstance: Pinia): void {
  const storesToPersist = [
    { store: useAllCardsStore(piniaInstance), keyPrefix: 'allCards' },
    { store: useHandCardsStore(piniaInstance), keyPrefix: 'handCards' },
    {
      store: useCompletedCardsStore(piniaInstance),
      keyPrefix: 'completedCards',
    },
    {
      store: useShuffeledCardsStore(piniaInstance),
      keyPrefix: 'shuffeledCards',
    },
    { store: usePlayerStore(piniaInstance), keyPrefix: 'player' },
    { store: useShopStore(piniaInstance), keyPrefix: 'shop' },
    { store: useLocationsStore(piniaInstance), keyPrefix: 'location' },
    { store: useTimersStore(piniaInstance), keyPrefix: 'timersStore' },
    { store: useLanguageStore(piniaInstance), keyPrefix: 'language' },
  ];

  storesToPersist.forEach(({ store, keyPrefix }) => {
    // Initial load is handled by the state definition itself

    // Subscribe to changes for saving
    store.$subscribe((_mutation, state: Record<string, any>) => {
      // Automatically save all state properties with the storeName_propertyName format
      Object.keys(state).forEach((propertyName) => {
        const propertyValue = state[propertyName];
        if (propertyValue !== undefined) {
          saveToLocalStorage(`${keyPrefix}_${propertyName}`, propertyValue);
        }
      });
    });
  });
}
