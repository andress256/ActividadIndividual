import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/auth/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
