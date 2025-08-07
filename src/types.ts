export interface Card {
  id: string;
  title: string;
  description: string;
  rewardCoins: string;
  rewardPowerUp: string;
  type: 'Úkol' | 'Prokletí';
  timestamp?: Date;
  timer?: number;
  timerEnd?: Date;
}

export interface ShopItem {
  title: string;
  description?: string;
  price: number;
  type: 'transit' | 'powerup';
  icon: string;
  function?: string;
}

export interface CSVRow {
  title?: string;
  description?: string;
  rewardCoins?: string;
  rewardPowerUp?: string;
  type?: string;
  price?: string;
  icon?: string;
  function?: string;
  plusCode?: string;
  url?: string;
}

export interface Location {
  title: string;
  description?: string;
  latitude: number;
  longitude: number;
  url: string;
}
