import { defineStore } from 'pinia';

export const useAllCardsStore = defineStore('allCards', {
    state: () => ([]),
    actions: {
        setCards(cards) {
            this.cards = cards;
        }
    }
});

export const useHandCardsStore = defineStore('handCards', {
    state: () => ([])
});

export const useCompletedCardsStore = defineStore('completedCards', {
    state: () => ([])
});