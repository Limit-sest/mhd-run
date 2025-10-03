import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import CardsView from '@/views/CardsView.vue';
import SettingsView from '@/views/SettingsView.vue';
import ShopView from '@/views/ShopView.vue';
import LocationView from '@/views/LocationView.vue';
import CompletedCardsView from '@/views/CompletedCardsView.vue';
import ShopViewNew from '@/views/ShopViewNew.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'home',
    component: CardsView,
  },
  {
    path: '/completed',
    name: 'completed',
    component: CompletedCardsView,
  },
  {
    path: '/settings',
    name: 'settings',
    component: SettingsView,
  },
  {
    path: '/shop',
    name: 'shop',
    component: ShopView,
  },
  {
    path: '/shop-new',
    name: 'shop-new',
    component: ShopViewNew,
  },
  {
    path: '/location',
    name: 'location',
    component: LocationView,
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
