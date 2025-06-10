import { createRouter, createWebHistory } from 'vue-router';
import CardsView from '../views/CardsView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: CardsView,
    },
  ],
});

export default router;
