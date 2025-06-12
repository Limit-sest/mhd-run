import {
  useAllCardsStore,
  useShuffeledCardsStore,
  useHandCardsStore,
  useCompletedCardsStore,
  usePlayerStore,
} from './stores';
import Papa from 'papaparse';
import { storeToRefs } from 'pinia';

export const generateUniqueId = () =>
  `card_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

export const getCardDetails = (cardId) => {
  const allCards = useAllCardsStore();
  return allCards.cards.find((card) => card.id === cardId);
};

export const fetchCSV = async (csvUrl) => {
  if (!csvUrl) {
    throw new Error('Chyba: URL pro CSV data nebyla poskytnuta.');
  }

  const response = await fetch(csvUrl);
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

  if (!parseResult.data || parseResult.data.length === 0) {
    throw new Error('CSV soubor je prázdný nebo neobsahuje žádná data.');
  }

  return parseResult.data; // Returns all rows, including potential headers
};

export const proccessCards = (dataRows, allCardsStore, shuffeledCardsStore) => {
  if (!dataRows || dataRows.length <= 1) {
    // Needs at least a header and one data row
    throw new Error(
      'CSV data neobsahuje žádné datové řádky (pouze hlavičku nebo je prázdné).'
    );
  }

  const actualDataRows = dataRows.slice(1); // Skip header row

  if (actualDataRows.length === 0) {
    throw new Error('CSV neobsahuje žádné datové řádky (pouze hlavičku).');
  }

  const parsedCards = actualDataRows
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
  shuffeledCardsStore.shuffleCards(); // Relies on allCardsStore being updated
};

export const loadAndProcessCards = async (
  csvUrl,
  allCardsStoreInstance,
  shuffeledCardsStoreInstance
) => {
  if (!allCardsStoreInstance || !shuffeledCardsStoreInstance) {
    console.error('Chyba: Store instance(s) nebyly poskytnuty.');
    return;
  }
  try {
    const dataRows = await fetchCSV(csvUrl);
    proccessCards(dataRows, allCardsStoreInstance, shuffeledCardsStoreInstance);
  } catch (err) {
    console.error(
      'Chyba při načítání nebo zpracování karet z CSV:',
      err.message
    );
    // Reset stores in case of an error
    allCardsStoreInstance.setCards([]);
    // Assuming shuffeledCardsStore might not have a setCards method,
    // directly resetting its 'cards' state if necessary.
    // It's better if shuffeledCardsStore also has a reset or setCards([]) action.
    if (shuffeledCardsStoreInstance.cards) {
      shuffeledCardsStoreInstance.cards = [];
    }
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
  const allCards = useAllCardsStore();
  const player = usePlayerStore();

  const cardIndexInHand = handCards.cards.value.indexOf(cardId);
  if (cardIndexInHand > -1) {
    const [cardToCompleteId] = handCards.cards.value.splice(cardIndexInHand, 1);
    completedCards.cards.value.push(cardToCompleteId);
    const cardDetails = allCards.cards.find(
      (card) => card.id === cardToCompleteId
    );
    player.addCoins(cardDetails.rewardCoins);
    player.addPowerup(cardDetails.rewardPowerUp);
  }
};
