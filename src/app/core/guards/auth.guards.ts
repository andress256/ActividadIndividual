import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserRole } from '../../models/app-user.model';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAuthenticated()) return true;

  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url },
  });
};

/** Página de inicio de cada rol: el administrador entra al cuadro de mando. */
export function homeUrl(auth: AuthService): string {
  if (!auth.isAuthenticated()) return '/login';
  return auth.hasRole('admin') ? '/dashboard' : '/incidencias';
}

/** Redirección de la ruta raíz y de las rutas desconocidas. */
export const homeRedirect = () => homeUrl(inject(AuthService));

/** Evita volver a la pantalla de login con la sesión ya iniciada. */
export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  return auth.isAuthenticated() ? inject(Router).parseUrl(homeUrl(auth)) : true;
};

export function roleGuard(requiredRole: UserRole): CanActivateFn {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    if (!auth.isAuthenticated()) return router.createUrlTree(['/login']);
    if (auth.hasRole(requiredRole)) return true;

    return router.createUrlTree(['/incidencias']);
  };
}
