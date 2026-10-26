import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { fakeToken } from '../../../testing/fake-token';
import { TokenStorageService } from '../services/token-storage.service';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('añade la cabecera Authorization cuando hay token', () => {
    const token = fakeToken('admin');
    TestBed.inject(TokenStorageService).setToken(token);

    http.get('/api/test').subscribe();

    const request = httpMock.expectOne('/api/test');
    expect(request.request.headers.get('Authorization')).toBe(`Bearer ${token}`);
    request.flush({});
  });

  it('no modifica la petición si no hay token', () => {
    http.get('/api/test').subscribe();

    const request = httpMock.expectOne('/api/test');
    expect(request.request.headers.has('Authorization')).toBe(false);
    request.flush({});
  });
});
