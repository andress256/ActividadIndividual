import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree, provideRouter } from '@angular/router';
import { fakeToken } from '../../../testing/fake-token';
import { TokenStorageService } from '../services/token-storage.service';
import { authGuard, roleGuard } from './auth.guards';

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
});
