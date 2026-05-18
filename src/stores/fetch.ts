import { defineStore } from 'pinia';

export const useFetchTimestamp = defineStore('fetchTimestamp', {
  state: () => ({
    cards: undefined,
  }),
});

export const useLanguageStore = defineStore('language', {
  state: () => ({
    lang: navigator.language.split('-')[0],
  }),
  persist: true,
});
