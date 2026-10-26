// `ng build` sustituye este archivo por `environment.prod.ts` (ver `fileReplacements` en angular.json).

export const environment = {
  production: false,
  /** Base de la API REST (SQL). Por defecto, el mock JSON incluido en assets. */
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
