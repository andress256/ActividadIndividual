import { supabaseConfig } from './supabase.config';

export const environment = {
  production: true,
  supabase: supabaseConfig,
  apiBaseUrl: 'assets/api',
  firebase: {
    apiKey: '',
    authDomain: '',
    projectId: '',
    appId: '',
  },
};
