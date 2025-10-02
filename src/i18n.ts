import { createI18n } from 'vue-i18n';
import en from './locales/en.json';
import cs from './locales/cs.json';
import { watch } from 'vue';

const messages = { en, cs };
type MessageSchema = typeof cs;

export const i18n = createI18n<[MessageSchema], 'en' | 'cs'>({
  locale: navigator.language.split('-')[0],
  fallbackLocale: 'cs',
  messages,
});

export async function initializeI18n() {
  const { useLanguageStore } = await import('./stores');
  const { storeToRefs } = await import('pinia');

  const languages = storeToRefs(useLanguageStore());
  i18n.global.locale = languages.lang.value;
  watch(
    () => i18n.global.locale,
    (lang) => (languages.lang.value = lang)
  );
}
