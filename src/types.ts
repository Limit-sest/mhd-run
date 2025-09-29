export interface Card {
  id: number;
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
  timer?: number;
  shareDescription?: string;
  id?: number;
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
  id?: string;
  timer?: string;
  shareDescription?: string;
}

export interface Location {
  title: string;
  description?: string;
  latitude: number;
  longitude: number;
  url: string;
}

export interface Timer {
  powerupId?: number;
  start: Date;
  end: Date;
}
