import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IncidentView } from '../../../models/incident.model';
import { IncidentTableComponent } from './incident-table.component';

const make = (i: number, title: string): IncidentView => ({
  id: `INC-00${i}`,
  title,
  description: '',
  status: 'open',
  priority: 'medium',
  departmentId: 1,
  departmentName: 'Sistemas',
  createdAt: `2026-0${i}-01T10:00:00Z`,
  createdBy: 'usuario',
});

describe('IncidentTableComponent', () => {
  let fixture: ComponentFixture<IncidentTableComponent>;
  const rows = [make(1, 'Impresora'), make(2, 'Fuga de agua'), make(3, 'VPN caída')];

  const bodyRows = () =>
    [...(fixture.nativeElement as HTMLElement).querySelectorAll('tbody tr')].map((tr) => tr.textContent ?? '');

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [IncidentTableComponent] }).compileComponents();
    fixture = TestBed.createComponent(IncidentTableComponent);
    fixture.componentRef.setInput('incidents', rows);
    fixture.componentRef.setInput('pageSize', 2);
    fixture.componentRef.setInput('caption', 'Tabla de prueba');
    await fixture.whenStable();
  });

  it('muestra el caption y pagina las filas recibidas por @Input', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('caption')?.textContent).toContain('Tabla de prueba');
    expect(bodyRows()).toHaveLength(2);
    expect(el.querySelector('.pagination span')?.textContent).toContain('Página 1 de 2');
  });

  it('filtra con la búsqueda (enlace bidireccional search)', async () => {
    fixture.componentInstance.search.set('vpn');
    await fixture.whenStable();
    expect(bodyRows()).toHaveLength(1);
    expect(bodyRows()[0]).toContain('VPN caída');
  });

  it('ordena por columna y actualiza aria-sort', async () => {
    fixture.componentInstance.sortBy('title');
    await fixture.whenStable();
    expect(bodyRows()[0]).toContain('Fuga de agua');
    const th = (fixture.nativeElement as HTMLElement).querySelectorAll('th')[1];
    expect(th.getAttribute('aria-sort')).toBe('ascending');
  });

  it('emite rowSelected al pulsar el título de una fila', async () => {
    const selected: IncidentView[] = [];
    fixture.componentInstance.rowSelected.subscribe((row) => selected.push(row));
    (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('tbody .link-button')!.click();
    expect(selected).toHaveLength(1);
    expect(selected[0].id).toBe('INC-003');
  });
});
