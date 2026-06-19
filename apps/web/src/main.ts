import './assets/main.css';
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import App from './App.vue';
import router from './router';
import { registerSW } from 'virtual:pwa-register';
import { i18n, initializeI18n } from './i18n';

registerSW({
  onNeedRefresh() {
    window.location.reload();
  },
  onOfflineReady() {},
});

const app = createApp(App);
const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

app.use(router);
app.use(pinia);
initializeI18n().then(() => {
  app.use(i18n);
  app.mount('#app');
});
