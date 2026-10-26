import { UserRole } from '../app/models/app-user.model';

/** Crea un token con formato JWT como el que genera AuthService, para los tests. */
export function fakeToken(role: UserRole, expiresInSeconds = 3600): string {
  const encode = (value: object) =>
    btoa(JSON.stringify(value)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const header = encode({ alg: 'none', typ: 'JWT' });
  const body = encode({
    username: role === 'admin' ? 'admin' : 'usuario',
    role,
    exp: Math.floor(Date.now() / 1000) + expiresInSeconds,
  });
  return `${header}.${body}.demo`;
}
