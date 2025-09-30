import './assets/main.css';
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { setupStorePersistence } from './stores';
import App from './App.vue';
import router from './router';
import { registerSW } from 'virtual:pwa-register';
import { createI18n } from 'vue-i18n';
import en from './locales/en.json';
import cs from './locales/cs.json';

const messages = { en, cs };
type MessageSchema = typeof cs;

registerSW({
  onNeedRefresh() {
    // optional: show a "Refresh" button
    console.log('New content available, refresh to update.');
  },
  onOfflineReady() {
    console.log('App is ready to work offline.');
  },
});

const app = createApp(App);
const pinia = createPinia();

const i18n = createI18n<[MessageSchema], 'en' | 'cs'>({
  locale: 'en',
  fallbackLocale: 'cs',
  messages,
});

app.use(router);
app.use(pinia);
app.use(i18n);
setupStorePersistence(pinia);
app.mount('#app');
