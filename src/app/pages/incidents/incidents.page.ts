import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonMenuButton,
  IonSpinner,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';
import { IncidentApiService } from '../../core/services/incident-api.service';
import { IncidentView } from '../../models/incident.model';
import { IncidentTableComponent } from '../../shared/components/incident-table/incident-table.component';

@Component({
  selector: 'app-incidents',
  standalone: true,
  imports: [
    RouterLink,
    IncidentTableComponent,
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonMenuButton,
    IonSpinner,
    IonTitle,
    IonToolbar,
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button aria-label="Abrir menú de navegación" />
        </ion-buttons>
        <ion-title>Incidencias</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <main id="main-content" tabindex="-1" class="page-wide">
        <div class="page-heading">
          <h1>Listado de incidencias</h1>
          <ion-button routerLink="/incidencias/nueva">Nueva incidencia</ion-button>
        </div>

        @if (loading()) {
          <p role="status"><ion-spinner name="crescent" aria-hidden="true" /> Cargando incidencias…</p>
        } @else if (error()) {
          <div role="alert">
            <p>{{ error() }}</p>
            <ion-button fill="outline" (click)="load()">Reintentar</ion-button>
          </div>
        } @else {
          <app-incident-table
            caption="Todas las incidencias"
            [incidents]="incidents()"
            [(search)]="search"
            (rowSelected)="open($event)"
          />
        }
      </main>
    </ion-content>
  `,
})
export class IncidentsPage {
  private readonly api = inject(IncidentApiService);
  private readonly router = inject(Router);

  readonly incidents = signal<IncidentView[]>([]);
  readonly search = signal('');
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

  open(incident: IncidentView): void {
    void this.router.navigate(['/incidencias', incident.id]);
  }
}
