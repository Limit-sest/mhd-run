import './assets/main.css';
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { setupStorePersistence } from './stores';
import App from './App.vue';
import router from './router';

const app = createApp(App);
const pinia = createPinia();

app.use(router);
app.use(pinia);
setupStorePersistence(pinia);
app.mount('#app');
