import { Component, inject, input, signal } from '@angular/core';
import { IonButton, IonIcon } from '@ionic/angular';
import { ReportExportService } from '../../../core/services/report-export.service';
import { IncidentFilter } from '../../../models/incident-filter.model';
import { IncidentView } from '../../../models/incident.model';

/** Botones para descargar en PDF y CSV las filas que recibe. */
@Component({
  selector: 'app-export-buttons',
  standalone: true,
  imports: [IonButton, IonIcon],
  template: `
    <div class="export" role="group" [attr.aria-label]="'Exportar informe de ' + rows().length + ' registros'">
      <ion-button fill="outline" [disabled]="!rows().length || busy()" (click)="pdf()">
        <ion-icon slot="start" name="document-text-outline" aria-hidden="true" />
        {{ busy() ? 'Generando…' : 'PDF' }}
      </ion-button>
      <ion-button fill="outline" [disabled]="!rows().length" (click)="csv()">
        <ion-icon slot="start" name="download-outline" aria-hidden="true" />
        CSV
      </ion-button>
    </div>
    <p role="status" class="status">{{ message() }}</p>
  `,
  styles: `
    :host { display: flex; flex-direction: column; align-items: flex-end; }
    .export { display: flex; flex-wrap: wrap; align-items: center; gap: 0.5rem; }
    .export ion-button { margin: 0; }
    .status { margin: 0.25rem 0 0; font-size: 0.85rem; color: var(--app-muted-text); }
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
