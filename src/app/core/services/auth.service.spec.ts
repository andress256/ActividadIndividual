import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { fakeToken } from '../../../testing/fake-token';
import { AuthService } from './auth.service';
import { TokenStorageService } from './token-storage.service';

describe('AuthService', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
  });

  it('rechaza un usuario inexistente o una contraseña incorrecta', async () => {
    const auth = TestBed.inject(AuthService);
    expect(await auth.login('nadie', 'x')).toBe(false);
    expect(await auth.login('admin', 'contraseña-incorrecta')).toBe(false);
    expect(auth.user()).toBeNull();
  });

  it('recupera el usuario y su rol a partir del token guardado', () => {
    TestBed.inject(TokenStorageService).setToken(fakeToken('admin'));
    const auth = TestBed.inject(AuthService);
    expect(auth.user()).toEqual({ username: 'admin', role: 'admin' });
    expect(auth.hasRole('admin')).toBe(true);
    expect(auth.hasRole('user')).toBe(false);
  });

  it('descarta un token manipulado o caducado', () => {
    const storage = TestBed.inject(TokenStorageService);
    const auth = TestBed.inject(AuthService);

    storage.setToken('basura.no-es-base64.demo');
    expect(auth.getCurrentUser()).toBeNull();

    storage.setToken(fakeToken('user', -1));
    expect(auth.getCurrentUser()).toBeNull();
    expect(storage.getToken()).toBeNull();
  });

  it('logout borra el token y el usuario', () => {
    TestBed.inject(TokenStorageService).setToken(fakeToken('user'));
    const auth = TestBed.inject(AuthService);
    auth.logout(false);
    expect(auth.user()).toBeNull();
    expect(auth.isAuthenticated()).toBe(false);
  });
});
