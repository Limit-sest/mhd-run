import type { Card, CSVRow, ShopItem, Location } from '../types';
import {
  useAllCardsStore,
  useShuffeledCardsStore,
  useShopStore,
  useLocationsStore,
} from '../stores';
import Papa from 'papaparse';
import OpenLocationCode from 'open-location-code-typescript';
import { i18n } from '../i18n';
import { getHash } from './hash';

export async function fetchCSV(csvUrl: string): Promise<CSVRow[]> {
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
      .map(function (e) {
        return `Error: ${e.message} (řádek: ${e.row})`;
      })
      .join('; ');
    throw new Error(`Chyba při parsování CSV: ${errorMessages}`);
  }

  if (!parseResult.data || parseResult.data.length === 0) {
    throw new Error(
      'CSV soubor je prázdný nebo neobsahuje žádná data (po zpracování hlaviček).'
    );
  }

  return parseResult.data;
}

function convertCSVToShopItems(csvData: CSVRow[]): ShopItem[] {
  return csvData.map(function (row): ShopItem {
    return {
      title: row.title || '',
      description: row.description,
      price: parseInt(row.price || '0'),
      type: row.type === 'powerup' ? 'powerup' : 'transit',
      icon: row.icon || '',
      id: isNaN(parseInt(row.id)) ? getHash(row.title) : parseInt(row.id),
      shareDescription: row.shareDescription,
      timer: parseInt(row.timer),
    };
  });
}

function proccessCards(
  dataRows: CSVRow[],
  allCardsStore: ReturnType<typeof useAllCardsStore>,
  shuffeledCardsStore: ReturnType<typeof useShuffeledCardsStore>,
  destructive: boolean = true
): void {
  if (dataRows.length === 0) {
    throw new Error('Empty csv!');
  }

  const parsedCards: Card[] = dataRows
    .map(function (row): Card | null {
      const title = row['title']?.trim();
      const description = row['description']?.trim();
      const rewardCoins = parseInt(String(row['rewardCoins'])?.trim()) || 0;
      const rewardPowerUp = parseInt(String(row['rewardPowerUp'])?.trim()) || 0;
      const type = String(row['type'])?.trim();
      const timer = parseInt(row['timer']);

      return {
        id: getHash(title),
        title: title || 'Neznámý titul',
        description: description || 'Žádný popis',
        rewardCoins,
        rewardPowerUp,
        type: type === 'Prokletí' ? 'Prokletí' : 'Úkol',
        timer,
      };
    })
    .filter(function (card): card is Card {
      return card !== null;
    });

  allCardsStore.setCards(parsedCards);
  if (destructive || shuffeledCardsStore.cards.length === 0)
    shuffeledCardsStore.shuffleCards();
}

function proccessLocations(dataRows: CSVRow[]): Location[] {
  const locations = dataRows.map(function (row) {
    const referenceLat: number = 50.0755; // Prague latitude
    const referenceLng: number = 14.4378; // Prague longitude
    const shortCode = row.plusCode.split(' ')[0];
    const fullCode: string = OpenLocationCode.recoverNearest(
      shortCode as string,
      referenceLat,
      referenceLng
    );
    const decoded = OpenLocationCode.decode(fullCode);

    const latitude = decoded.latitudeCenter;
    const longitude = decoded.longitudeCenter;

    return {
      title: row.title,
      description: row.description,
      url: row.url,
      latitude,
      longitude,
    };
  });
  return locations;
}

export async function fetchAllData(destructive = true): Promise<void> {
  const cardCsv =
    import.meta.env.VITE_CARD ||
    'https://docs.google.com/spreadsheets/d/e/2PACX-1vT1e_ojo2j2rL4q1UBHufG2YRQ-f5AgLAAenJMn_jRHmnx8WoErH9F93jJL6aZ4DQ4x33uA-sxu_hxB/pub?gid=0&single=true&output=csv';
  const transitCsv =
    import.meta.env.VITE_SHOP_TRANSIT ||
    'https://docs.google.com/spreadsheets/d/e/2PACX-1vT1e_ojo2j2rL4q1UBHufG2YRQ-f5AgLAAenJMn_jRHmnx8WoErH9F93jJL6aZ4DQ4x33uA-sxu_hxB/pub?gid=1746737016&single=true&output=csv';
  const powerupCsv =
    import.meta.env.VITE_SHOP_POWERUP ||
    'https://docs.google.com/spreadsheets/d/e/2PACX-1vT1e_ojo2j2rL4q1UBHufG2YRQ-f5AgLAAenJMn_jRHmnx8WoErH9F93jJL6aZ4DQ4x33uA-sxu_hxB/pub?gid=1927382705&single=true&output=csv';
  const locationCsv =
    import.meta.env.VITE_LOCATION ||
    'https://docs.google.com/spreadsheets/d/e/2PACX-1vT1e_ojo2j2rL4q1UBHufG2YRQ-f5AgLAAenJMn_jRHmnx8WoErH9F93jJL6aZ4DQ4x33uA-sxu_hxB/pub?gid=912143845&single=true&output=csv';

  const shuffledCardsIds = useShuffeledCardsStore();
  const allCards = useAllCardsStore();
  const shop = useShopStore();
  const locationStore = useLocationsStore();

  try {
    const cardDataRows = await fetchCSV(cardCsv);
    const transit = await fetchCSV(transitCsv);
    const powerup = await fetchCSV(powerupCsv);
    const locations = await fetchCSV(locationCsv);

    shop.setTransit(convertCSVToShopItems(transit));
    shop.setPowerups(convertCSVToShopItems(powerup));
    proccessCards(cardDataRows, allCards, shuffledCardsIds, destructive);
    locationStore.setAllLocations(proccessLocations(locations));
  } catch (error) {
    console.error('Failed to fetch game data:', error);
    throw error;
  }
}
