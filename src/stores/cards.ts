import { defineStore } from 'pinia';
import type { Card } from '../types';
import { dateSerializer } from './_serializers';

export const useAllCardsStore = defineStore('allCards', {
  state: () => ({
    cards: [] as Card[],
  }),
  actions: {
    setCards(cards: Card[]) {
      const existing = new Map(this.cards.map((c: Card) => [c.id, c]));
      this.cards = cards.map((card) => {
        const prev = existing.get(card.id) as Card | undefined;
        if (prev) {
          if (prev.timestamp) card.timestamp = prev.timestamp;
          if (prev.timerEnd) card.timerEnd = prev.timerEnd;
        }
        return card;
      });
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
