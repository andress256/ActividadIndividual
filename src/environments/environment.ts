// `ng build` sustituye este archivo por `environment.prod.ts` (ver `fileReplacements` en angular.json).
import { supabaseConfig } from './supabase.config';

export const environment = {
  production: false,
  /**
   * Base de datos SQL en Supabase. Los valores salen de `.env` o de las
   * variables de entorno (ver scripts/set-env.mjs). Si están vacíos se usa
   * la API REST simulada de `apiBaseUrl`.
   */
  supabase: supabaseConfig,
  /** API REST simulada (JSON en assets), usada cuando no hay Supabase. */
  apiBaseUrl: 'assets/api',
  /**
   * Configuración web pública de Firebase. Si `projectId` está vacío, el feed
   * de actividad en tiempo real usa la implementación local.
   */
  firebase: {
    apiKey: '',
    authDomain: '',
    projectId: '',
    appId: '',
  },
};
