export type CardType = 'task' | 'curse';
export type ShopItemType = 'transit' | 'powerup';
export type Currency = 'coin' | 'gem';

export interface AdminCard {
  id: number;
  titleCs: string;
  titleEn: string | null;
  descriptionCs: string | null;
  descriptionEn: string | null;
  rewardCoins: number;
  rewardGems: number;
  type: CardType;
  timerMinutes: number | null;
}

export interface AdminShopItem {
  id: number;
  titleCs: string;
  titleEn: string | null;
  descriptionCs: string | null;
  descriptionEn: string | null;
  price: number;
  type: ShopItemType;
  currency: Currency;
  icon: string;
  shareDescriptionCs: string | null;
  shareDescriptionEn: string | null;
  timerMinutes: number | null;
}

/** Form payloads omit the server-managed id. */
export type CardForm = Omit<AdminCard, 'id'>;
export type ShopForm = Omit<AdminShopItem, 'id'>;
