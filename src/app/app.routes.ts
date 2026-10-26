import { Routes } from '@angular/router';
import { authGuard, guestGuard, homeRedirect, roleGuard } from './core/guards/auth.guards';

export const routes: Routes = [
  {
    path: 'login',
    title: 'Iniciar sesión · Incidencias360',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./pages/auth/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'dashboard',
    title: 'Cuadro de mando · Incidencias360',
    canActivate: [roleGuard('admin')],
    loadComponent: () =>
      import('./pages/dashboard/dashboard.page').then((m) => m.DashboardPage),
  },
  {
    path: 'incidencias',
    title: 'Incidencias · Incidencias360',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/incidents/incidents.page').then((m) => m.IncidentsPage),
  },
  {
    path: 'incidencias/nueva',
    title: 'Nueva incidencia · Incidencias360',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/incidents/incident-form.page').then((m) => m.IncidentFormPage),
  },
  {
    path: 'incidencias/:id',
    title: 'Editar incidencia · Incidencias360',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/incidents/incident-form.page').then((m) => m.IncidentFormPage),
  },
  {
    path: 'ayuda',
    title: 'Ayuda · Incidencias360',
    loadComponent: () => import('./pages/help/help.page').then((m) => m.HelpPage),
  },
  // La página de inicio depende del rol (admin → cuadro de mando).
  { path: '', pathMatch: 'full', redirectTo: homeRedirect },
  { path: '**', redirectTo: homeRedirect },
];
