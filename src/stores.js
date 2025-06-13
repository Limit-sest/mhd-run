import { defineStore } from 'pinia';
import { getFromLocalStorage, saveToLocalStorage } from './utils';

export const useAllCardsStore = defineStore('allCards', {
  state: () => ({
    cards: getFromLocalStorage('allCards_cards') || [],
  }),
  actions: {
    setCards(cards) {
      this.cards = cards;
    },
  },
});

export const useHandCardsStore = defineStore('handCards', {
  state: () => ({
    cards: getFromLocalStorage('handCards_cards') || [],
  }),
  actions: {
    setCards(cards) {
      this.cards = cards;
    },
  },
});

export const useCompletedCardsStore = defineStore('completedCards', {
  state: () => ({
    cards: getFromLocalStorage('completedCards_cards') || [],
  }),
  actions: {
    setCards(cards) {
      this.cards = cards;
    },
  },
});

export const useShuffeledCardsStore = defineStore('shuffeledCards', {
  state: () => ({
    cards: getFromLocalStorage('shuffeledCards_cards') || [],
  }),
  actions: {
    shuffleCards() {
      const allCardsStore = useAllCardsStore();
      const handCardsStore = useHandCardsStore();
      const completedCardsStore = useCompletedCardsStore();
      // Ensure allCardsStore.cards is populated before mapping
      const cardIdsToShuffle = allCardsStore.cards
        ? allCardsStore.cards.map((card) => card.id)
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
  }),
  actions: {
    setCoins(coins) {
      this.coins = parseInt(coins);
    },
    setPowerup(powerup) {
      this.powerup = parseInt(powerup);
    },
    addCoins(amount) {
      this.coins += parseInt(amount);
    },
    addPowerup(amount) {
      this.powerup += parseInt(amount);
    },
    removeCoins(amount) {
      this.coins = Math.max(0, this.coins - parseInt(amount));
    },
    removePowerup(amount) {
      this.powerup = Math.max(0, this.powerup - parseInt(amount));
    },
  },
});

export const useShopStore = defineStore('shop', {
  state: () => ({
    transit: getFromLocalStorage('shop_transit') || [],
    powerups: getFromLocalStorage('shop_powerups') || [],
    shoppingCart: {
      transit: {},
      powerup: {},
      totalPowerups: 0,
    },
  }),
  getters: {
    totalCoins: (state) => {
      let sum = 0;
      for (const itemIndex in state.shoppingCart.transit) {
        const quantity = state.shoppingCart.transit[itemIndex];
        const price = parseInt(state.transit[itemIndex].price);
        sum += quantity * price;
      }
      return sum;
    },
  },
  actions: {
    setTransit(value) {
      this.transit = value;
    },
    setPowerups(value) {
      this.powerups = value;
    },
    initializeTransitCart() {
      this.transit.forEach((_, index) => {
        this.shoppingCart.transit[index] = 0;
      });
    },
    addShopItem(itemIndex) {
      const currentCount = this.shoppingCart.transit[itemIndex] || 0;
      this.shoppingCart.transit[itemIndex] = currentCount + 1;
    },
    removeShopItem(itemIndex) {
      const currentCount = this.shoppingCart.transit[itemIndex] || 0;
      if (currentCount > 0) {
        this.shoppingCart.transit[itemIndex] = currentCount - 1;
      }
    },
  },
});

export const useDoublePowerupStore = defineStore('doublePowerup', {
  state: () => ({
    isActive: false,
  }),
  actions: {
    toggle() {
      this.isActive ? (this.isActive = false) : (this.isActive = true);
    },
  },
});

// Function to setup persistence for all stores
export function setupStorePersistence(piniaInstance) {
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
  ];

  storesToPersist.forEach(({ store, keyPrefix }) => {
    // Initial load is handled by the state definition itself

    // Subscribe to changes for saving
    store.$subscribe((mutation, state) => {
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
    });
  });
}
