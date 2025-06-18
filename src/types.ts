export interface Card {
  id: string;
  title: string;
  description: string;
  rewardCoins: number;
  rewardPowerup: number;
  type: 'challenge' | 'curse';
  timestamp?: Date;
}

export interface ShopItem {
  title: string;
  description?: string;
  price: number;
  type: 'transit' | 'powerup';
  icon: string;
  function?: string;
}
