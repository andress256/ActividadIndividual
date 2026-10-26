import { Component, inject, input, signal } from '@angular/core';
import { IonButton } from '@ionic/angular';
import { ReportExportService } from '../../../core/services/report-export.service';
import { IncidentFilter } from '../../../models/incident-filter.model';
import { IncidentView } from '../../../models/incident.model';

/** Botones para descargar en PDF y CSV las filas que recibe. */
@Component({
  selector: 'app-export-buttons',
  standalone: true,
  imports: [IonButton],
  template: `
    <div class="export" role="group" aria-label="Exportar informe">
      <ion-button size="small" fill="outline" [disabled]="!rows().length || busy()" (click)="pdf()">
        {{ busy() ? 'Generando PDF…' : 'Exportar PDF' }}
      </ion-button>
      <ion-button size="small" fill="outline" [disabled]="!rows().length" (click)="csv()">
        Exportar CSV
      </ion-button>
      <span class="count">{{ rows().length }} registros</span>
    </div>
    <p role="status" class="status">{{ message() }}</p>
  `,
  styles: `
    .export { display: flex; flex-wrap: wrap; align-items: center; gap: 0.5rem; }
    .count { font-size: 0.875rem; }
    .status:empty { display: none; }
  `,
})
export class ExportButtonsComponent {
  /** Filas que se exportarán (normalmente las ya filtradas). */
  readonly rows = input.required<IncidentView[]>();
  /** Filtros aplicados, para describirlos en el PDF. */
  readonly filter = input<Partial<IncidentFilter>>({});

  private readonly exporter = inject(ReportExportService);
  readonly busy = signal(false);
  readonly message = signal('');

  csv(): void {
    this.exporter.exportCsv(this.rows());
    this.message.set('CSV descargado.');
  }

  async pdf(): Promise<void> {
    this.busy.set(true);
    this.message.set('');
    try {
      await this.exporter.exportPdf(this.rows(), this.filter());
      this.message.set('PDF descargado.');
    } catch {
      this.message.set('No se pudo generar el PDF.');
    } finally {
      this.busy.set(false);
    }
  }
}
