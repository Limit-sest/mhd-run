import { createI18n } from 'vue-i18n';
import en from './locales/en.json';
import cs from './locales/cs.json';

const messages = { en, cs };
type MessageSchema = typeof cs;

const i18n = createI18n<[MessageSchema], 'en' | 'cs'>({
  locale: 'en',
  fallbackLocale: 'cs',
  messages,
});

export default i18n;
