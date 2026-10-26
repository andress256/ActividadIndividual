import { EMPTY_FILTER, applyIncidentFilter } from './incident-filter.model';
import { IncidentView } from './incident.model';

const rows: IncidentView[] = [
  { id: 'INC-001', title: 'Impresora sin conexión', description: '', status: 'open', priority: 'high', departmentId: 1, departmentName: 'Sistemas', createdAt: '2026-05-10T10:00:00Z', createdBy: 'usuario' },
  { id: 'INC-002', title: 'Fuga de agua', description: '', status: 'closed', priority: 'low', departmentId: 2, departmentName: 'Mantenimiento', createdAt: '2026-07-01T10:00:00Z', createdBy: 'admin' },
  { id: 'INC-003', title: 'VPN caída', description: '', status: 'open', priority: 'low', departmentId: 1, departmentName: 'Sistemas', createdAt: '2026-09-20T10:00:00Z', createdBy: 'admin' },
];

describe('applyIncidentFilter', () => {
  it('sin filtros devuelve todas las filas', () => {
    expect(applyIncidentFilter(rows, EMPTY_FILTER)).toHaveLength(3);
  });

  it('busca en título, código y departamento sin distinguir mayúsculas', () => {
    expect(applyIncidentFilter(rows, { ...EMPTY_FILTER, search: 'vpn' }).map((r) => r.id)).toEqual(['INC-003']);
    expect(applyIncidentFilter(rows, { ...EMPTY_FILTER, search: 'inc-002' })).toHaveLength(1);
    expect(applyIncidentFilter(rows, { ...EMPTY_FILTER, search: 'sistemas' })).toHaveLength(2);
  });

  it('combina estado, prioridad y rango de fechas', () => {
    const result = applyIncidentFilter(rows, {
      ...EMPTY_FILTER,
      status: 'open',
      priority: 'low',
      from: '2026-09-01',
      to: '2026-09-30',
    });
    expect(result.map((r) => r.id)).toEqual(['INC-003']);
  });

  it('no modifica la lista original', () => {
    const copy = [...rows];
    applyIncidentFilter(rows, { ...EMPTY_FILTER, status: 'closed' });
    expect(rows).toEqual(copy);
  });
});
