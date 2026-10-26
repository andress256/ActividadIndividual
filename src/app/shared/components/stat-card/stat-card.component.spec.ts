import { TestBed } from '@angular/core/testing';
import { StatCardComponent } from './stat-card.component';

describe('StatCardComponent', () => {
  async function create(selectable: boolean) {
    await TestBed.configureTestingModule({ imports: [StatCardComponent] }).compileComponents();
    const fixture = TestBed.createComponent(StatCardComponent);
    fixture.componentRef.setInput('label', 'Abiertas');
    fixture.componentRef.setInput('value', 7);
    fixture.componentRef.setInput('selectable', selectable);
    await fixture.whenStable();
    return fixture;
  }

  it('muestra el valor y la etiqueta recibidos', async () => {
    const fixture = await create(false);
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.value')?.textContent).toBe('7');
    expect(el.querySelector('.label')?.textContent).toBe('Abiertas');
    expect(el.querySelector('button')).toBeNull();
  });

  it('si es seleccionable es un botón que emite selected', async () => {
    const fixture = await create(true);
    let count = 0;
    fixture.componentInstance.selected.subscribe(() => count++);
    const button = (fixture.nativeElement as HTMLElement).querySelector('button')!;
    expect(button.getAttribute('aria-pressed')).toBe('false');
    button.click();
    expect(count).toBe(1);
  });
});
