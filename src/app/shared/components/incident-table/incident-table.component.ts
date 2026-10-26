import { DatePipe } from '@angular/common';
import { Component, computed, effect, input, model, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonButton, IonSearchbar } from '@ionic/angular';
import {
  IncidentView,
  PRIORITY_LABELS,
  STATUS_LABELS,
} from '../../../models/incident.model';

type SortKey = 'id' | 'title' | 'departmentName' | 'priority' | 'status' | 'createdAt';

const PRIORITY_ORDER = { low: 0, medium: 1, high: 2 };

/**
 * Tabla de incidencias reutilizable con buscador, ordenación y paginación.
 *
 * Es agnóstica de la vista: recibe los datos por `@Input` y notifica al padre
 * con eventos (`rowSelected`) y con el enlace bidireccional `[(search)]`.
 */
@Component({
  selector: 'app-incident-table',
  standalone: true,
  imports: [DatePipe, FormsModule, IonButton, IonSearchbar],
  templateUrl: './incident-table.component.html',
  styleUrl: './incident-table.component.scss',
})
export class IncidentTableComponent {
  /** Filas a mostrar. */
  readonly incidents = input.required<IncidentView[]>();
  /** Texto del `<caption>` (nombre accesible de la tabla). */
  readonly caption = input('Incidencias');
  /** Filas por página. */
  readonly pageSize = input(8);
  /** Texto de búsqueda, enlazable en ambos sentidos con `[(search)]`. */
  readonly search = model('');
  /** Se emite al activar una fila (clic o Enter). */
  readonly rowSelected = output<IncidentView>();

  readonly statusLabels = STATUS_LABELS;
  readonly priorityLabels = PRIORITY_LABELS;
  readonly columns: { key: SortKey; label: string }[] = [
    { key: 'id', label: 'Código' },
    { key: 'title', label: 'Título' },
    { key: 'departmentName', label: 'Departamento' },
    { key: 'priority', label: 'Prioridad' },
    { key: 'status', label: 'Estado' },
    { key: 'createdAt', label: 'Fecha' },
  ];

  readonly sortKey = signal<SortKey>('createdAt');
  readonly sortAsc = signal(false);
  readonly page = signal(0);

  /** Filas filtradas por la búsqueda y ordenadas. */
  readonly rows = computed(() => {
    const term = this.search().trim().toLowerCase();
    const key = this.sortKey();
    const dir = this.sortAsc() ? 1 : -1;
    return this.incidents()
      .filter(
        (row) =>
          !term ||
          row.title.toLowerCase().includes(term) ||
          row.id.toLowerCase().includes(term) ||
          row.departmentName.toLowerCase().includes(term),
      )
      .sort((a, b) => {
        if (key === 'priority') return (PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]) * dir;
        return String(a[key]).localeCompare(String(b[key]), 'es') * dir;
      });
  });

  readonly pageCount = computed(() => Math.max(1, Math.ceil(this.rows().length / this.pageSize())));
  readonly pageRows = computed(() => {
    const start = this.page() * this.pageSize();
    return this.rows().slice(start, start + this.pageSize());
  });

  constructor() {
    // Al cambiar la búsqueda o los datos se vuelve a la primera página.
    effect(() => {
      this.search();
      this.incidents();
      this.page.set(0);
    });
  }

  sortBy(key: SortKey): void {
    if (this.sortKey() === key) {
      this.sortAsc.update((asc) => !asc);
    } else {
      this.sortKey.set(key);
      this.sortAsc.set(true);
    }
  }

  ariaSort(key: SortKey): 'ascending' | 'descending' | 'none' {
    if (this.sortKey() !== key) return 'none';
    return this.sortAsc() ? 'ascending' : 'descending';
  }

  goTo(page: number): void {
    this.page.set(Math.min(Math.max(page, 0), this.pageCount() - 1));
  }
}
