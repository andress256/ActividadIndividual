import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree, provideRouter } from '@angular/router';
import { fakeToken } from '../../../testing/fake-token';
import { TokenStorageService } from '../services/token-storage.service';
import { authGuard, guestGuard, homeRedirect, roleGuard } from './auth.guards';

describe('Guards de autenticación', () => {
  const route = {} as ActivatedRouteSnapshot;
  const state = { url: '/incidencias' } as RouterStateSnapshot;

  const run = (guard: typeof authGuard) =>
    TestBed.runInInjectionContext(() => guard(route, state));

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
  });

  it('authGuard redirige a /login (con returnUrl) si no hay sesión', () => {
    const result = run(authGuard) as UrlTree;
    expect(TestBed.inject(Router).serializeUrl(result)).toBe('/login?returnUrl=%2Fincidencias');
  });

  it('authGuard permite el paso con un token válido', () => {
    TestBed.inject(TokenStorageService).setToken(fakeToken('user'));
    expect(run(authGuard)).toBe(true);
  });

  it('authGuard rechaza un token caducado', () => {
    TestBed.inject(TokenStorageService).setToken(fakeToken('user', -10));
    expect(run(authGuard)).toBeInstanceOf(UrlTree);
  });

  it('roleGuard(admin) rechaza al usuario estándar', () => {
    TestBed.inject(TokenStorageService).setToken(fakeToken('user'));
    const result = run(roleGuard('admin')) as UrlTree;
    expect(TestBed.inject(Router).serializeUrl(result)).toBe('/incidencias');
  });

  it('roleGuard(admin) permite al administrador', () => {
    TestBed.inject(TokenStorageService).setToken(fakeToken('admin'));
    expect(run(roleGuard('admin'))).toBe(true);
  });

  it('la página de inicio depende del rol', () => {
    const home = () => TestBed.runInInjectionContext(() => homeRedirect());
    expect(home()).toBe('/login');

    const storage = TestBed.inject(TokenStorageService);
    storage.setToken(fakeToken('admin'));
    expect(home()).toBe('/dashboard');

    storage.setToken(fakeToken('user'));
    expect(home()).toBe('/incidencias');
  });

  it('guestGuard saca de /login a quien ya tiene sesión', () => {
    expect(run(guestGuard)).toBe(true);
    TestBed.inject(TokenStorageService).setToken(fakeToken('admin'));
    const result = run(guestGuard) as UrlTree;
    expect(TestBed.inject(Router).serializeUrl(result)).toBe('/dashboard');
  });
});
