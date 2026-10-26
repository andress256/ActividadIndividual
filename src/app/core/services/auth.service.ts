import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthUser, UserRole } from '../../models/app-user.model';
import { TokenStorageService } from './token-storage.service';

interface DemoAccount extends AuthUser {
  passwordHash: string;
}

// Cuentas sintéticas de prueba: solo se guarda el hash SHA-256 de cada contraseña.
const ACCOUNTS: DemoAccount[] = [
  {
    username: 'admin',
    role: 'admin',
    passwordHash: '411aafab4b0a634690102908c3a946eccef8496bb9d86f0899abeb8f2fb5ac84',
  },
  {
    username: 'usuario',
    role: 'user',
    passwordHash: '6e0c545a835bb092f10a8fa64c055f788c994718606146feeb7801c4fce475f9',
  },
];

const encoder = new TextEncoder();

async function sha256(value: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(value));
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly tokenStorage = inject(TokenStorageService);
  private readonly router = inject(Router);

  /** Usuario con sesión iniciada, como signal para que las vistas reaccionen. */
  readonly user = signal<AuthUser | null>(null);

  constructor() {
    this.user.set(this.getCurrentUser());
  }

  async login(username: string, password: string): Promise<boolean> {
    const account = ACCOUNTS.find(
      (candidate) => candidate.username === username.trim(),
    );

    if (!account || (await sha256(password)) !== account.passwordHash) {
      return false;
    }

    const payload: AuthUser = {
      username: account.username,
      role: account.role,
    };

    // Token de demostración con formato JWT. No está firmado ni sirve para
    // autenticar peticiones en un servidor real.
    const header = this.base64Url(JSON.stringify({ alg: 'none', typ: 'JWT' }));
    const body = this.base64Url(
      JSON.stringify({
        ...payload,
        exp: Math.floor(Date.now() / 1000) + 60 * 60,
      }),
    );
    this.tokenStorage.setToken(`${header}.${body}.demo`);
    this.user.set(payload);

    return true;
  }

  getCurrentUser(): AuthUser | null {
    const token = this.tokenStorage.getToken();
    if (!token) return null;

    try {
      const [, encodedPayload] = token.split('.');
      const payload = JSON.parse(this.fromBase64Url(encodedPayload)) as AuthUser & {
        exp: number;
      };

      if (
        payload.exp <= Math.floor(Date.now() / 1000) ||
        !['admin', 'user'].includes(payload.role) ||
        typeof payload.username !== 'string'
      ) {
        this.logout(false);
        return null;
      }

      return { username: payload.username, role: payload.role };
    } catch {
      this.logout(false);
      return null;
    }
  }

  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }

  hasRole(role: UserRole): boolean {
    return this.getCurrentUser()?.role === role;
  }

  logout(navigate = true): void {
    this.tokenStorage.clear();
    this.user.set(null);
    if (navigate) void this.router.navigateByUrl('/login');
  }

  private base64Url(value: string): string {
    return btoa(value).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  }

  private fromBase64Url(value: string): string {
    const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
    return atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '='));
  }
}
