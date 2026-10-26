import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  IonButton,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonSpinner,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';
import { IncidentApiService } from '../../core/services/incident-api.service';
import { IncidentView, STATUS_LABELS } from '../../models/incident.model';

@Component({
  selector: 'app-incidents',
  standalone: true,
  imports: [RouterLink, IonButton, IonContent, IonHeader, IonItem, IonLabel, IonList, IonSpinner, IonTitle, IonToolbar],
  template: `
    <ion-header><ion-toolbar><ion-title>Incidencias</ion-title></ion-toolbar></ion-header>
    <ion-content class="ion-padding">
      <main id="main-content">
        <h1>Listado de incidencias</h1>
        <ion-button routerLink="/incidencias/nueva">Nueva incidencia</ion-button>

        @if (loading()) {
          <p role="status"><ion-spinner name="crescent" aria-hidden="true" /> Cargando incidencias…</p>
        } @else if (error()) {
          <p role="alert">{{ error() }}</p>
          <ion-button fill="outline" (click)="load()">Reintentar</ion-button>
        } @else if (incidents().length === 0) {
          <p>No hay incidencias registradas.</p>
        } @else {
          <ion-list>
            @for (incident of incidents(); track incident.id) {
              <ion-item [routerLink]="['/incidencias', incident.id]">
                <ion-label>
                  <h2>{{ incident.title }}</h2>
                  <p>{{ incident.id }} · {{ incident.departmentName }} · {{ statusLabels[incident.status] }}</p>
                </ion-label>
              </ion-item>
            }
          </ion-list>
        }
      </main>
    </ion-content>
  `,
})
export class IncidentsPage {
  private readonly api = inject(IncidentApiService);

  readonly statusLabels = STATUS_LABELS;
  readonly incidents = signal<IncidentView[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');

  /** Ionic mantiene la página en caché: se recarga cada vez que se muestra. */
  ionViewWillEnter(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set('');
    this.api.getIncidentViews().subscribe({
      next: (rows) => {
        this.incidents.set(rows);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar las incidencias.');
        this.loading.set(false);
      },
    });
  }
}
