import { computed, ref } from 'vue';

const TOKEN_KEY = 'mhd_admin_token';

const token = ref<string | null>(localStorage.getItem(TOKEN_KEY));

/** Read the current token outside of a component (used by the tRPC client). */
export function getToken(): string | null {
  return token.value;
}

export function useAuth() {
  const isAuthed = computed(() => Boolean(token.value));

  function setToken(value: string) {
    token.value = value;
    localStorage.setItem(TOKEN_KEY, value);
  }

  function clearToken() {
    token.value = null;
    localStorage.removeItem(TOKEN_KEY);
  }

  return { token, isAuthed, setToken, clearToken };
}
