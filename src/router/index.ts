import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import CardsView from '@/views/CardsView.vue';
import SettingsView from '@/views/SettingsView.vue';
import ShopView from '@/views/ShopView.vue';
import LocationView from '@/views/LocationView.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'home',
    component: CardsView,
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
