import type { Card, CSVRow, ShopItem } from './types';
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

export const generateUniqueId = (): string =>
  `card_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

export const getCardDetails = (cardId: string): Card | undefined => {
  const allCards = useAllCardsStore();
  return allCards.cards.find((card: Card) => card.id === cardId);
};

export const fetchCSV = async (csvUrl: string): Promise<CSVRow[]> => {
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

  const parseResult = Papa.parse<CSVRow>(csvText, {
    header: true,
    skipEmptyLines: true,
  });

  if (parseResult.errors.length > 0) {
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

  return parseResult.data;
};

const convertCSVToShopItems = (csvData: CSVRow[]): ShopItem[] => {
  return csvData.map(
    (row): ShopItem => ({
      title: row.title || '',
      description: row.description,
      price: parseInt(row.price || '0'),
      type: row.type === 'powerup' ? 'powerup' : 'transit',
      icon: row.icon || '',
      function: row.function,
    })
  );
};

export const proccessCards = (
  dataRows: CSVRow[],
  allCardsStore: ReturnType<typeof useAllCardsStore>,
  shuffeledCardsStore: ReturnType<typeof useShuffeledCardsStore>
): void => {
  if (!dataRows || dataRows.length <= 1) {
    throw new Error(
      'CSV data neobsahuje žádné datové řádky (pouze hlavičku nebo je prázdné).'
    );
  }

  if (dataRows.length === 0) {
    throw new Error('CSV neobsahuje žádné datové řádky');
  }

  const parsedCards: Card[] = dataRows
    .map((row): Card | null => {
      const title = row['title']?.trim();
      const description = row['description']?.trim();
      const rewardCoins = String(row['rewardCoins'])?.trim();
      const rewardPowerUp = String(row['rewardPowerUp'])?.trim();
      const type = String(row['type'])?.trim();

      return {
        id: generateUniqueId(),
        title: title || 'Neznámý titul',
        description: description || 'Žádný popis',
        rewardCoins: rewardCoins || '0',
        rewardPowerUp: rewardPowerUp || '0',
        type: type === 'Prokletí' ? 'Prokletí' : 'Úkol',
      };
    })
    .filter((card): card is Card => card !== null);

  if (parsedCards.length === 0) {
    throw new Error(
      'Po parsování nebyly nalezeny žádné platné karty. Zkontrolujte formát CSV a obsah datových řádků.'
    );
  }

  allCardsStore.setCards(parsedCards);
  shuffeledCardsStore.shuffleCards();
};

export const fetchAllData = async (): Promise<void> => {
  const cardCsv = import.meta.env.VITE_CARD_CSV_URL as string;
  const transitCsv = import.meta.env.VITE_SHOP_TRANSIT_CSV_URL as string;
  const powerupCsv = import.meta.env.VITE_SHOP_POWERUP_CSV_URL as string;

  const shuffledCardsIds = useShuffeledCardsStore();
  const allCards = useAllCardsStore();
  const shop = useShopStore();

  try {
    const cardDataRows = await fetchCSV(cardCsv);
    const transit = await fetchCSV(transitCsv);
    const powerup = await fetchCSV(powerupCsv);

    shop.setTransit(convertCSVToShopItems(transit));
    shop.setPowerups(convertCSVToShopItems(powerup));
    proccessCards(cardDataRows, allCards, shuffledCardsIds);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error(
      'Chyba při načítání nebo zpracování karet z CSV:',
      errorMessage
    );
    // Reset stores in case of an error
    shop.setTransit([]);
    shop.setPowerups([]);
    allCards.setCards([]);
  }
};

const rewardCard = (cardId: string): void => {
  const allCards = useAllCardsStore();
  const player = usePlayerStore();
  const doublePowerup = useDoublePowerupStore();

  const cardDetails = allCards.getCardDetails(cardId);
  if (!cardDetails) return;

  const coinsReward = parseInt(cardDetails.rewardCoins);
  const powerupReward = parseInt(cardDetails.rewardPowerUp);

  if (doublePowerup.isActive) {
    player.addCoins(coinsReward * 2);
    player.addPowerup(powerupReward * 2);
    doublePowerup.toggle();
  } else {
    player.addCoins(coinsReward);
    player.addPowerup(powerupReward);
  }
};

export const drawCard = (): void => {
  const shuffledCards = storeToRefs(useShuffeledCardsStore());
  const handCards = storeToRefs(useHandCardsStore());
  const allCards = useAllCardsStore();

  const cardIdToDraw = shuffledCards.cards.value.shift();
  if (!cardIdToDraw) return;

  handCards.cards.value.unshift(cardIdToDraw);
  allCards.addTimestamp(cardIdToDraw);

  const card = allCards.cards.find((card: Card) => card.id === cardIdToDraw);
  if (card?.type === 'Prokletí') {
    rewardCard(cardIdToDraw);
  }
};

export const completeCard = (cardId: string, reward: boolean = true): void => {
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
};

export const getFromLocalStorage = <T = unknown>(key: string): T | null => {
  const item = localStorage.getItem(key);
  try {
    const parsed = item ? JSON.parse(item) : null;

    const reviveDates = (obj: unknown): unknown => {
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

    return reviveDates(parsed) as T;
  } catch (e) {
    console.error(`Error parsing localStorage item ${key}:`, e);
    return null;
  }
};

export const saveToLocalStorage = (key: string, value: unknown): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving to localStorage item ${key}:`, e);
  }
};
