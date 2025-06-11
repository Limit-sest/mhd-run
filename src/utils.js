import {
  useAllCardsStore,
  useShuffeledCardsStore,
  useHandCardsStore,
  useCompletedCardsStore,
} from './stores';
import Papa from 'papaparse';
import { storeToRefs } from 'pinia';

const PUBLIC_CSV_URL = import.meta.env.VITE_PUBLIC_CSV_URL;

export const generateUniqueId = () =>
  `card_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

export const getCardDetails = (cardId) => {
  const allCards = useAllCardsStore();
  return allCards.cards.find((card) => card.id === cardId);
};

export const loadCardsFromPublishedCSV = async () => {
  if (!PUBLIC_CSV_URL) {
    console.error('Chyba: PUBLIC_CSV_URL není nastavena.');
    return;
  }

  const allCardsStore = useAllCardsStore();
  const shuffeledCardsStore = useShuffeledCardsStore();

  try {
    const response = await fetch(PUBLIC_CSV_URL);
    if (!response.ok) {
      throw new Error(
        `Nepodařilo se načíst CSV: ${response.status} ${response.statusText}`
      );
    }
    const csvText = await response.text();
    const parseResult = Papa.parse(csvText, { skipEmptyLines: true });

    if (parseResult.errors.length > 0) {
      const errorMessages = parseResult.errors.map((e) => e.message).join('; ');
      throw new Error(`Chyba při parsování CSV: ${errorMessages}`);
    }

    let dataRows = parseResult.data;
    if (!dataRows || dataRows.length === 0) {
      throw new Error('CSV soubor je prázdný nebo neobsahuje žádná data.');
    }

    dataRows = dataRows.slice(1);

    if (dataRows.length === 0) {
      throw new Error('CSV neobsahuje žádné datové řádky (pouze hlavičku).');
    }

    const parsedCards = dataRows
      .map((columns) => {
        if (!Array.isArray(columns) || columns.length < 5) {
          console.warn(
            'Přeskakuji řádek s nedostatečným počtem sloupců v CSV:',
            columns
          );
          return null;
        }
        return {
          id: generateUniqueId(),
          title: columns[0]?.trim() || 'Neznámý titul',
          description: columns[1]?.trim() || 'Žádný popis',
          rewardCoins: columns[2]?.trim() || '0',
          rewardPowerUp: columns[3]?.trim() || '0',
          type: columns[4]?.trim() === 'Prokletí' ? 'Prokletí' : 'Úkol',
        };
      })
      .filter((card) => card !== null);

    if (parsedCards.length === 0) {
      throw new Error(
        'Po parsování nebyly nalezeny žádné platné karty. Zkontrolujte formát CSV a obsah datových řádků.'
      );
    }

    allCardsStore.setCards(parsedCards);
    shuffeledCardsStore.shuffleCards();
  } catch (err) {
    console.error('Chyba při načítání nebo zpracování karet z CSV:', err);
    allCardsStore.setCards([]);
    shuffeledCardsStore.cards = [];
  }
};

export const drawCard = () => {
  const shuffledCards = storeToRefs(useShuffeledCardsStore());
  const handCards = storeToRefs(useHandCardsStore());

  const cardIdToDraw = shuffledCards.cards.value.shift(); // Removes from top (start of array)
  handCards.cards.value.push(cardIdToDraw);
};

export const completeCard = (cardId) => {
  const handCards = storeToRefs(useHandCardsStore());
  const completedCards = storeToRefs(useCompletedCardsStore());

  const cardIndexInHand = handCards.cards.value.indexOf(cardId);
  if (cardIndexInHand > -1) {
    const [cardToCompleteId] = handCards.cards.value.splice(cardIndexInHand, 1);
    completedCards.cards.value.push(cardToCompleteId);
  }
};
