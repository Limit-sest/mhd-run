/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

declare module '@/router' {
  import type { Router } from 'vue-router';
  const router: Router;
  export default router;
}

declare module '@/router/index' {
  import type { Router } from 'vue-router';
  const router: Router;
  export default router;
}

declare module 'virtual:pwa-register' {
  export interface RegisterSWOptions {
    immediate?: boolean;
    onNeedRefresh?: () => void;
    onOfflineReady?: () => void;
    onRegistered?: (
      registration: ServiceWorkerRegistration | undefined
    ) => void;
    onRegisterError?: (error: any) => void;
  }

  export function registerSW(
    options?: RegisterSWOptions
  ): (reloadPage?: boolean) => Promise<void>;
}

interface ImportMetaEnv {
  readonly VITE_CARD_CSV_URL: string;
  readonly VITE_SHOP_TRANSIT_CSV_URL: string;
  readonly VITE_SHOP_POWERUP_CSV_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
