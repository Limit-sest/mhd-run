import {
  useAllCardsStore,
  useShuffeledCardsStore,
  useHandCardsStore,
  useCompletedCardsStore,
  usePlayerStore,
  useShopStore,
  useDoublePowerupStore,
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
  // Use header: true to get an array of objects
  const parseResult = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
  });

  if (parseResult.errors.length > 0) {
    // parseResult.errors might contain more detailed error objects
    const errorMessages = parseResult.errors
      .map((e) => `Error: ${e.message} (řádek: ${e.row})`)
      .join('; ');
    throw new Error(`Chyba při parsování CSV: ${errorMessages}`);
  }

  if (!parseResult.data || parseResult.data.length === 0) {
    throw new Error(
      'CSV soubor je prázdný nebo neobsahuje žádná data (po zpracování hlaviček).'
    );
  }

  return parseResult.data; // Returns an array of objects
};

export const proccessCards = (dataRows, allCardsStore, shuffeledCardsStore) => {
  if (!dataRows || dataRows.length <= 1) {
    // Needs at least a header and one data row
    throw new Error(
      'CSV data neobsahuje žádné datové řádky (pouze hlavičku nebo je prázdné).'
    );
  }

  if (dataRows.length === 0) {
    throw new Error('CSV neobsahuje žádné datové řádky');
  }
  const parsedCards = dataRows
    .map((row) => {
      return {
        id: generateUniqueId(),
        title: row['title']?.trim() || 'Neznámý titul',
        description: row['description']?.trim() || 'Žádný popis',
        rewardCoins: String(row['rewardCoins'])?.trim() || '0',
        rewardPowerUp: String(row['rewardPowerUp'])?.trim() || '0',
        type: String(row['type'])?.trim() === 'Prokletí' ? 'Prokletí' : 'Úkol',
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

export const fetchAllData = async () => {
  const cardCsv = import.meta.env.VITE_CARD_CSV_URL;
  const transitCsv = import.meta.env.VITE_SHOP_TRANSIT_CSV_URL;
  const powerupCsv = import.meta.env.VITE_SHOP_POWERUP_CSV_URL;

  const shuffledCardsIds = useShuffeledCardsStore();
  const allCards = useAllCardsStore();
  const shop = useShopStore();
  try {
    const cardDataRows = await fetchCSV(cardCsv);
    const transit = await fetchCSV(transitCsv);
    const powerup = await fetchCSV(powerupCsv);

    shop.setTransit(transit);
    shop.setPowerups(powerup);
    proccessCards(cardDataRows, allCards, shuffledCardsIds);
  } catch (err) {
    console.error(
      'Chyba při načítání nebo zpracování karet z CSV:',
      err.message
    );
    // Reset stores in case of an error
    shop.setTransit([]);
    shop.setPowerups([]);
    allCards.setCards([]);
  }
};

const rewardCard = (cardId) => {
  const allCards = useAllCardsStore();
  const player = usePlayerStore();
  const doublePowerup = useDoublePowerupStore();

  const cardDetails = allCards.getCardDetails(cardId);
  if (doublePowerup.isActive) {
    player.addCoins(cardDetails.rewardCoins * 2);
    player.addPowerup(cardDetails.rewardPowerUp * 2);
    doublePowerup.toggle();
  } else {
    player.addCoins(cardDetails.rewardCoins);
    player.addPowerup(cardDetails.rewardPowerUp);
  }
};

export const drawCard = () => {
  const shuffledCards = storeToRefs(useShuffeledCardsStore());
  const handCards = storeToRefs(useHandCardsStore());
  const allCards = useAllCardsStore();

  const cardIdToDraw = shuffledCards.cards.value.shift(); // Removes from top (start of array)
  handCards.cards.value.push(cardIdToDraw);

  allCards.addTimestamp(cardIdToDraw);

  const card = allCards.cards.find((card) => card.id === cardIdToDraw);
  if (card.type === 'Prokletí') {
    rewardCard(cardIdToDraw);
  }
};

export const completeCard = (cardId, reward = true) => {
  const handCards = storeToRefs(useHandCardsStore());
  const completedCards = storeToRefs(useCompletedCardsStore());

  const cardIndexInHand = handCards.cards.value.indexOf(cardId);
  if (cardIndexInHand > -1) {
    const [cardToCompleteId] = handCards.cards.value.splice(cardIndexInHand, 1);
    completedCards.cards.value.push(cardToCompleteId);
    if (reward) {
      rewardCard(cardToCompleteId);
    }
  }
};

export const getFromLocalStorage = (key) => {
  const item = localStorage.getItem(key);
  try {
    const parsed = item ? JSON.parse(item) : null;

    // Recursively convert ISO date strings to Date objects
    const reviveDates = (obj) => {
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
    };

    return reviveDates(parsed);
  } catch (e) {
    console.error(`Error parsing localStorage item ${key}:`, e);
    return null;
  }
};

export const saveToLocalStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving to localStorage item ${key}:`, e);
  }
};
