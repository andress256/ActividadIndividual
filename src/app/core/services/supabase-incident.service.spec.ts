import type { SupabaseClient } from '@supabase/supabase-js';
import { firstValueFrom } from 'rxjs';
import {
  IncidentRow,
  SupabaseIncidentService,
  escapeLike,
  toIncidentView,
  toRow,
} from './supabase-incident.service';

const ROW: IncidentRow = {
  id: 'INC-001',
  title: 'Fuga de agua',
  description: 'Hay agua en el almacén',
  status: 'open',
  priority: 'high',
  department_id: 2,
  created_at: '2026-05-01T10:00:00Z',
  created_by: 'usuario',
  departments: { name: 'Mantenimiento' },
};

/**
 * Cliente de Supabase falso: cada método del query builder se encadena y
 * queda registrado; al hacer `await` devuelve `result`.
 */
function fakeClient(result: unknown) {
  const calls: [string, unknown[]][] = [];
  const builder: Record<string, unknown> = {
    then: (resolve: (value: unknown) => void) => resolve(result),
  };
  for (const method of ['select', 'order', 'eq', 'neq', 'ilike', 'insert', 'update', 'single']) {
    builder[method] = (...args: unknown[]) => {
      calls.push([method, args]);
      return builder;
    };
  }
  // El cliente no es "thenable" (como el real); solo lo es el query builder.
  const client = {
    from: (table: string) => {
      calls.push(['from', [table]]);
      return builder;
    },
  };
  return { client: client as unknown as SupabaseClient, calls };
}

function serviceWith(result: unknown) {
  const service = new SupabaseIncidentService();
  const fake = fakeClient(result);
  (service as unknown as { client: Promise<SupabaseClient> }).client = Promise.resolve(fake.client);
  return { service, calls: fake.calls };
}

describe('SupabaseIncidentService (PostgreSQL)', () => {
  it('convierte columnas snake_case al modelo e incluye el departamento del JOIN', () => {
    expect(toIncidentView(ROW)).toEqual({
      id: 'INC-001',
      title: 'Fuga de agua',
      description: 'Hay agua en el almacén',
      status: 'open',
      priority: 'high',
      departmentId: 2,
      createdAt: '2026-05-01T10:00:00Z',
      createdBy: 'usuario',
      departmentName: 'Mantenimiento',
    });
  });

  it('solo envía las columnas modificadas en un UPDATE', () => {
    expect(toRow({ status: 'closed', departmentId: 3, title: '  Nuevo título ' })).toEqual({
      status: 'closed',
      department_id: 3,
      title: 'Nuevo título',
    });
  });

  it('escapa los comodines de LIKE', () => {
    expect(escapeLike('100% real_ok')).toBe('100\\% real\\_ok');
  });

  it('pide las incidencias con JOIN a departments ordenadas por fecha', async () => {
    const { service, calls } = serviceWith({ data: [ROW], error: null });
    const rows = await firstValueFrom(service.getIncidentViews());
    expect(rows[0].departmentName).toBe('Mantenimiento');
    expect(calls).toContainEqual(['from', ['incidents']]);
    expect(calls).toContainEqual(['select', ['*, departments(name)']]);
    expect(calls).toContainEqual(['order', ['created_at', { ascending: false }]]);
  });

  it('isTitleTaken cuenta coincidencias con ILIKE y excluye la incidencia editada', async () => {
    const { service, calls } = serviceWith({ count: 1, error: null });
    expect(await firstValueFrom(service.isTitleTaken(' fuga de agua ', 'INC-009'))).toBe(true);
    expect(calls).toContainEqual(['ilike', ['title', 'fuga de agua']]);
    expect(calls).toContainEqual(['neq', ['id', 'INC-009']]);
  });

  it('propaga los errores de la base de datos', async () => {
    const { service } = serviceWith({ data: null, error: new Error('permission denied') });
    await expect(firstValueFrom(service.getIncidents())).rejects.toThrow('permission denied');
  });

  it('crea incidencias en estado abierto con columnas de la tabla', async () => {
    const { service, calls } = serviceWith({ data: ROW, error: null });
    await firstValueFrom(
      service.create({ title: 'Fuga de agua', description: 'Hay agua en el almacén', priority: 'high', departmentId: 2 }, 'usuario'),
    );
    const insert = calls.find(([method]) => method === 'insert')?.[1][0] as Record<string, unknown>;
    expect(insert).toMatchObject({ status: 'open', department_id: 2, created_by: 'usuario' });
    expect(insert).not.toHaveProperty('departmentId');
  });
});
