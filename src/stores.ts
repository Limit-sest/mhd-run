import { defineStore } from 'pinia';
import type { Pinia } from 'pinia';
import { getFromLocalStorage, saveToLocalStorage, getDistance } from './utils';
import type { Card, ShopItem, Location } from './types';

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
    getCardDetails(cardId: string): Card | undefined {
      return this.cards.find((card: Card) => card.id === cardId);
    },
    addTimestamp(cardId: string) {
      const card = this.getCardDetails(cardId);
      if (card) {
        card.timestamp = new Date();
      }
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
    coins: getFromLocalStorage('player_coins') || 0,
    powerup: getFromLocalStorage('player_powerup') || 0,
    ownedPowerups: getFromLocalStorage('player_ownedPowerups') || ([] as number[]),
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
    addOwnedPowerup(powerupIndex: number) {
      if (!this.ownedPowerups.includes(powerupIndex)) {
        this.ownedPowerups.push(powerupIndex);
      }
    },
    hasOwnedPowerup(powerupIndex: number): boolean {
      return this.ownedPowerups.includes(powerupIndex);
    },
  },
});

export const useShopStore = defineStore('shop', {
  state: () => ({
    transit: getFromLocalStorage('shop_transit') || ([] as ShopItem[]),
    powerups: getFromLocalStorage('shop_powerups') || ([] as ShopItem[]),
    shoppingCart: {
      transit: {} as Record<number, number>,
      powerup: {} as Record<number, boolean>,
      totalPowerups: 0,
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
      this.shoppingCart.powerup[itemIndex] = !this.shoppingCart.powerup[itemIndex];
    },
  },
});

export const useDoublePowerupStore = defineStore('doublePowerup', {
  state: () => ({
    isActive: false,
  }),
  actions: {
    toggle() {
      this.isActive = !this.isActive;
    },
  },
});

export const useLocationsStore = defineStore('locations', {
  state: () => ({
    currentLocation: undefined as Location | undefined,
    radiusSetting: getFromLocalStorage('location_radiusSetting') as { min: number, max: number } || { min: 4.5, max: 6 } as { min: number, max: number },
    allLocations: getFromLocalStorage('location_allLocations') || [] as Location[],
    latestGps: undefined as GeolocationPosition | undefined,
  }),
  actions: {
    drawLocation(gpsLat: number, gpsLon: number) {
      const validLocations: Location[] = this.allLocations.filter((location: Location) => {
        const distance = getDistance(gpsLat, gpsLon, location.latitude, location.longitude);
        return distance >= this.radiusSetting.min && distance <= this.radiusSetting.max;
      });

      if (validLocations.length > 0) {
        // If we found locations within the radius, pick one randomly
        this.currentLocation = validLocations[Math.floor(Math.random() * validLocations.length)];
      } else {
        // Fallback: find the location closest to the radius boundaries
        if (this.allLocations.length > 0) {
          let bestLocation = this.allLocations[0];
          let bestDistance = getDistance(gpsLat, gpsLon, bestLocation.latitude, bestLocation.longitude);
          let bestDistanceFromBoundary = Math.min(
            Math.abs(bestDistance - this.radiusSetting.min),
            Math.abs(bestDistance - this.radiusSetting.max)
          );

          for (const location of this.allLocations) {
            const distance = getDistance(gpsLat, gpsLon, location.latitude, location.longitude);

            const distanceFromMinBoundary = Math.abs(distance - this.radiusSetting.min);
            const distanceFromMaxBoundary = Math.abs(distance - this.radiusSetting.max);
            const distanceFromBoundary = Math.min(distanceFromMinBoundary, distanceFromMaxBoundary);

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

  ];

  storesToPersist.forEach(({ store, keyPrefix }) => {
    // Initial load is handled by the state definition itself

    // Subscribe to changes for saving
    store.$subscribe((_mutation, state: Record<string, any>) => {
      // 'mutation' provides details about the change, 'state' is the new state
      // We can save the entire state or specific parts
      // For simplicity, saving specific known properties:
      if (state.cards !== undefined) {
        saveToLocalStorage(`${keyPrefix}_cards`, state.cards);
      }
      if (state.coins !== undefined) {
        saveToLocalStorage(`${keyPrefix}_coins`, state.coins);
      }
      if (state.powerup !== undefined) {
        saveToLocalStorage(`${keyPrefix}_powerup`, state.powerup);
      }
      if (state.transit !== undefined) {
        saveToLocalStorage(`${keyPrefix}_transit`, state.transit);
      }
      if (state.powerups !== undefined) {
        saveToLocalStorage(`${keyPrefix}_powerups`, state.powerups);
      }
      if (state.ownedPowerups !== undefined) {
        saveToLocalStorage(`${keyPrefix}_ownedPowerups`, state.ownedPowerups);
      }
      if (state.currentLocation !== undefined) {
        saveToLocalStorage(`${keyPrefix}_currentLocation`, state.currentLocation);
      }
    });
  });
}
