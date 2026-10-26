import { IncidentView } from '../../models/incident.model';
import { ReportExportService } from './report-export.service';

const row: IncidentView = {
  id: 'INC-001',
  title: 'Título con ; punto y coma y "comillas"',
  description: '',
  status: 'in-progress',
  priority: 'high',
  departmentId: 1,
  departmentName: 'Atención al cliente',
  createdAt: '2026-05-10T10:00:00Z',
  createdBy: 'usuario',
};

describe('ReportExportService', () => {
  const service = new ReportExportService();

  it('genera CSV con cabecera, etiquetas en español y separador ;', () => {
    const [header, line] = service.toCsv([row]).split('\r\n');
    expect(header).toBe('Código;Título;Departamento;Prioridad;Estado;Fecha;Creada por');
    expect(line).toContain(';Atención al cliente;Alta;En curso;');
  });

  it('escapa separadores y comillas según RFC 4180', () => {
    const line = service.toCsv([row]).split('\r\n')[1];
    expect(line).toContain('"Título con ; punto y coma y ""comillas"""');
  });

  it('el PDF y el CSV usan las mismas filas', () => {
    const table = service.toTable([row, { ...row, id: 'INC-002' }]);
    expect(table).toHaveLength(2);
    expect(table[1][0]).toBe('INC-002');
  });

  it('describe los filtros aplicados', () => {
    expect(service.describeFilter({})).toBe('sin filtros');
    expect(service.describeFilter({ status: 'open', priority: 'all', search: 'vpn' })).toBe(
      'búsqueda "vpn", estado Abierta',
    );
  });
});
