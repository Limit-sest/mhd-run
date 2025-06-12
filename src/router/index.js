import { createRouter, createWebHistory } from 'vue-router';
import CardsView from '@/views/CardsView.vue';
import SettingsView from '@/views/SettingsView.vue';
import ShopView from '@/views/ShopView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
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
  ],
});

export default router;
