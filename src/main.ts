import './assets/main.css';
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { setupStorePersistence } from './stores';
import App from './App.vue';
import router from './router';
import { registerSW } from 'virtual:pwa-register';
import { i18n, initializeI18n } from './i18n';

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

app.use(router);
app.use(pinia);
setupStorePersistence(pinia);
await initializeI18n();
app.use(i18n);
app.mount('#app');
