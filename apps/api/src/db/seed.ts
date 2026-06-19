import type { CSVRow } from '@mhd/shared';
import OpenLocationCode from 'open-location-code-typescript';
import Papa from 'papaparse';

import { client, db } from './index';
import { cards, locations, shopItems } from './schema';

// Published Google Sheets CSV exports (same source the web app uses today).
const SHEET = (gid: string) =>
  `https://docs.google.com/spreadsheets/d/e/2PACX-1vRINMC6eKg8bWyZW9H-aZ9RTsqTMJgZSkVIS60ogExiBZ6I0NsI2C36vSP2Hgw-_qJYPr2OMWWA7ETB/pub?gid=${gid}&single=true&output=csv`;

const SOURCES = {
  cards: process.env.SEED_CARDS_CSV || SHEET('0'),
  locations: process.env.SEED_LOCATIONS_CSV || SHEET('912143845'),
  transitCs: process.env.SEED_TRANSIT_CS_CSV || SHEET('1746737016'),
  transitEn: process.env.SEED_TRANSIT_EN_CSV || SHEET('907602207'),
  powerupCs: process.env.SEED_POWERUP_CS_CSV || SHEET('1927382705'),
  powerupEn: process.env.SEED_POWERUP_EN_CSV || SHEET('1554125513'),
};

// Prague reference point used to recover full Plus Codes from short codes.
const REFERENCE_LAT = 50.0755;
const REFERENCE_LNG = 14.4378;

async function fetchCSV(url: string): Promise<CSVRow[]> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch CSV (${res.status} ${res.statusText}): ${url}`);
  }
  const text = await res.text();
  const parsed = Papa.parse<CSVRow>(text, { header: true, skipEmptyLines: true });
  if (parsed.errors.length > 0) {
    throw new Error(
      `CSV parse errors for ${url}: ${parsed.errors.map((e) => e.message).join('; ')}`
    );
  }
  return parsed.data;
}

const num = (v: string | undefined): number => {
  const n = parseInt(String(v ?? '').trim(), 10);
  return Number.isNaN(n) ? 0 : n;
};

const optionalNum = (v: string | undefined): number | null => {
  const n = parseInt(String(v ?? '').trim(), 10);
  return Number.isNaN(n) ? null : n;
};

const trimmed = (v: string | undefined): string | null => {
  const s = String(v ?? '').trim();
  return s.length > 0 ? s : null;
};

// ── Cards (single sheet, Czech — EN falls back to CS) ────────────────────────

function buildCards(rows: CSVRow[]) {
  return rows
    .filter((r) => trimmed(r.title))
    .map((r) => {
      const titleCs = String(r.title).trim();
      const descCs = trimmed(r.description);
      const type = String(r.type ?? '').trim() === 'Prokletí' ? 'curse' : 'task';
      return {
        titleCs,
        titleEn: titleCs,
        descriptionCs: descCs,
        descriptionEn: descCs,
        rewardCoins: num(r.rewardCoins),
        rewardGems: num(r.rewardPowerUp),
        type: type as 'task' | 'curse',
        timerMinutes: optionalNum(r.timer),
      };
    });
}

// ── Shop items (CS + EN sheets, joined by id/title) ──────────────────────────

const shopKey = (r: CSVRow, i: number) =>
  trimmed(r.id) ?? trimmed(r.title) ?? `idx-${i}`;

function buildShopItems(
  csRows: CSVRow[],
  enRows: CSVRow[],
  type: 'transit' | 'powerup'
) {
  const enByKey = new Map<string, CSVRow>();
  enRows.forEach((r, i) => enByKey.set(shopKey(r, i), r));

  return csRows
    .filter((r) => trimmed(r.title))
    .map((r, i) => {
      const en = enByKey.get(shopKey(r, i)) ?? r;
      const titleCs = String(r.title).trim();
      return {
        titleCs,
        titleEn: trimmed(en.title) ?? titleCs,
        descriptionCs: trimmed(r.description),
        descriptionEn: trimmed(en.description) ?? trimmed(r.description),
        price: num(r.price),
        type,
        currency: (type === 'powerup' ? 'gem' : 'coin') as 'coin' | 'gem',
        icon: trimmed(r.icon) ?? '',
        shareDescriptionCs: trimmed(r.shareDescription),
        shareDescriptionEn: trimmed(en.shareDescription) ?? trimmed(r.shareDescription),
        timerMinutes: optionalNum(r.timer),
      };
    });
}

// ── Locations (single sheet; resolve Plus Code → lat/lng) ────────────────────

function buildLocations(rows: CSVRow[]) {
  return rows
    .filter((r) => trimmed(r.plusCode) && trimmed(r.title))
    .map((r) => {
      const shortCode = String(r.plusCode).trim().split(' ')[0];
      const fullCode = OpenLocationCode.recoverNearest(
        shortCode,
        REFERENCE_LAT,
        REFERENCE_LNG
      );
      const decoded = OpenLocationCode.decode(fullCode);
      const titleCs = String(r.title).trim();
      const descCs = trimmed(r.description);
      return {
        titleCs,
        titleEn: titleCs,
        descriptionCs: descCs,
        descriptionEn: descCs,
        plusCode: shortCode,
        latitude: decoded.latitudeCenter.toFixed(6),
        longitude: decoded.longitudeCenter.toFixed(6),
        mapUrl: trimmed(r.url),
        category: null,
      };
    });
}

async function main() {
  console.log('Fetching CSV sources…');
  const [cardRows, locationRows, transitCs, transitEn, powerupCs, powerupEn] =
    await Promise.all([
      fetchCSV(SOURCES.cards),
      fetchCSV(SOURCES.locations),
      fetchCSV(SOURCES.transitCs),
      fetchCSV(SOURCES.transitEn),
      fetchCSV(SOURCES.powerupCs),
      fetchCSV(SOURCES.powerupEn),
    ]);

  const cardValues = buildCards(cardRows);
  const shopValues = [
    ...buildShopItems(transitCs, transitEn, 'transit'),
    ...buildShopItems(powerupCs, powerupEn, 'powerup'),
  ];
  const locationValues = buildLocations(locationRows);

  await db.transaction(async (tx) => {
    // Content tables only — re-seedable. Game tables are never touched here.
    await tx.delete(cards);
    await tx.delete(shopItems);
    await tx.delete(locations);

    if (cardValues.length) await tx.insert(cards).values(cardValues);
    if (shopValues.length) await tx.insert(shopItems).values(shopValues);
    if (locationValues.length) await tx.insert(locations).values(locationValues);
  });

  console.log('Seed complete:');
  console.log(`  cards:      ${cardValues.length}`);
  console.log(`  shop_items: ${shopValues.length}`);
  console.log(`  locations:  ${locationValues.length}`);
}

main()
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await client.end();
  });
