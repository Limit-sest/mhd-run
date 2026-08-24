import type { Card } from '../types';
import {
  useAllCardsStore,
  useShuffeledCardsStore,
  useHandCardsStore,
  useCompletedCardsStore,
  usePlayerStore,
  useGameSettingsStore,
} from '../stores';
import { POWERUP } from '../constants';
import { storeToRefs } from 'pinia';
import { ref } from 'vue';

export function getCardDetails(cardId: number): Card | undefined {
  const allCards = useAllCardsStore();
  return allCards.cards.find((card: Card) => card.id === cardId);
}

function rewardCard(cardId: number): void {
  const allCards = useAllCardsStore();
  const player = usePlayerStore();
  const cardDetails = allCards.getCardDetails(cardId);
  if (!cardDetails) return;

  const coinsReward = cardDetails.rewardCoins;
  const powerupReward = cardDetails.rewardPowerUp;

  if (player.doublePowerupCard.includes(cardId)) {
    player.addCoins(coinsReward * 2);
    player.addGems(powerupReward * 2);
  } else {
    player.addCoins(coinsReward);
    player.addGems(powerupReward);
  }
}

export const cardsToAnimate = ref([]);

export function drawCard(): void {
  const shuffledCards = storeToRefs(useShuffeledCardsStore());
  const handCards = storeToRefs(useHandCardsStore());
  const allCards = useAllCardsStore();
  const player = usePlayerStore();

  const cardIdToDraw = shuffledCards.cards.value.shift();
  if (!cardIdToDraw) return;

  handCards.cards.value.unshift(cardIdToDraw);
  allCards.addTimestamp(cardIdToDraw);
  cardsToAnimate.value.push(cardIdToDraw);

  setTimeout(() => {
    const index = cardsToAnimate.value.indexOf(cardIdToDraw);
    if (index !== -1) cardsToAnimate.value.splice(index);
  }, 700);

  const card: Card = allCards.cards.find(
    (card: Card) => card.id === cardIdToDraw
  );

  if (card.timer) {
    const gameSettings = useGameSettingsStore();
    allCards.addTimerEnd(cardIdToDraw, card.timer * gameSettings.multiplier);
  }

  if (player.hasOwnedPowerup(POWERUP.DOUBLE_REWARD)) {
    player.addDoublePowerupCard(cardIdToDraw);
    player.removeOwnedPowerup(POWERUP.DOUBLE_REWARD);
  }

  if (player.hasOwnedPowerup(POWERUP.TRANSFER_TASK) && card.type === 'Úkol') {
    player.addTransferPowerupCard(cardIdToDraw);
    player.removeOwnedPowerup(POWERUP.TRANSFER_TASK);
  }
}

export function completeCard(cardId: number, reward: boolean = true): void {
  const handCards = storeToRefs(useHandCardsStore());
  const completedCards = storeToRefs(useCompletedCardsStore());

  const cardIndexInHand = handCards.cards.value.indexOf(cardId);

  if (cardIndexInHand > -1) {
    const [cardToCompleteId] = handCards.cards.value.splice(cardIndexInHand, 1);
    completedCards.cards.value.unshift(cardToCompleteId);
    if (reward) {
      rewardCard(cardToCompleteId);
    }
  }
}
