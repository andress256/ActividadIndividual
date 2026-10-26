import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { Department, Incident } from '../../models/incident.model';
import { IncidentApiService } from './incident-api.service';

const INCIDENTS: Incident[] = [
  { id: 'INC-001', title: 'Impresora sin conexión', description: 'd', status: 'open', priority: 'high', departmentId: 1, createdAt: '2026-05-01T10:00:00Z', createdBy: 'usuario' },
  { id: 'INC-002', title: 'Fuga de agua', description: 'd', status: 'closed', priority: 'low', departmentId: 2, createdAt: '2026-06-01T10:00:00Z', createdBy: 'admin' },
];
const DEPARTMENTS: Department[] = [
  { id: 1, name: 'Sistemas' },
  { id: 2, name: 'Mantenimiento' },
];

describe('IncidentApiService (API REST SQL)', () => {
  let api: IncidentApiService;
  let httpMock: HttpTestingController;

  /** Responde a las peticiones pendientes de las dos tablas. */
  const flushTables = () => {
    httpMock.match((r) => r.url.endsWith('incidents.json')).forEach((r) => r.flush(INCIDENTS));
    httpMock.match((r) => r.url.endsWith('departments.json')).forEach((r) => r.flush(DEPARTMENTS));
  };

  beforeEach(() => {
    localStorage.clear();
    IncidentApiService.latency = 0;
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    api = TestBed.inject(IncidentApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('hace el JOIN de incidencias y departamentos, ordenado por fecha descendente', async () => {
    const result = firstValueFrom(api.getIncidentViews());
    flushTables();
    const rows = await result;
    expect(rows.map((r) => r.id)).toEqual(['INC-002', 'INC-001']);
    expect(rows[0].departmentName).toBe('Mantenimiento');
  });

  it('las incidencias creadas aparecen en las siguientes lecturas', async () => {
    const created = await firstValueFrom(
      api.create({ title: 'Nueva', description: 'Descripción larga', priority: 'medium', departmentId: 1 }, 'usuario'),
    );
    expect(created.status).toBe('open');

    const result = firstValueFrom(api.getIncidents());
    flushTables();
    expect((await result).some((r) => r.id === created.id)).toBe(true);
  });

  it('las actualizaciones se aplican sobre los datos de la API', async () => {
    const updated = firstValueFrom(api.update('INC-001', { status: 'closed' }));
    flushTables();
    expect((await updated).status).toBe('closed');
  });

  it('isTitleTaken ignora mayúsculas y excluye la incidencia que se edita', async () => {
    const taken = firstValueFrom(api.isTitleTaken('  FUGA DE AGUA '));
    flushTables();
    expect(await taken).toBe(true);

    const self = firstValueFrom(api.isTitleTaken('Fuga de agua', 'INC-002'));
    flushTables();
    expect(await self).toBe(false);
  });
});
