import { defineStore } from 'pinia';

const getFromLocalStorage = (key) => {
  const item = localStorage.getItem(key);
  try {
    return item ? JSON.parse(item) : null;
  } catch (e) {
    console.error(`Error parsing localStorage item ${key}:`, e);
    return null;
  }
};

const saveToLocalStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving to localStorage item ${key}:`, e);
  }
};

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
      this.coins = coins;
    },
    setPowerup(powerup) {
      this.powerup = powerup;
    },
    addCoins(amount) {
      this.coins += amount;
    },
    addPowerup(amount) {
      this.powerup += amount;
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
      // Add other properties as needed
    });
  });
}
