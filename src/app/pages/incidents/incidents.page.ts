import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonMenuButton,
  IonSpinner,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';
import { IncidentRepository } from '../../core/services/incident-repository';
import { EMPTY_FILTER, applyIncidentFilter } from '../../models/incident-filter.model';
import { IncidentView } from '../../models/incident.model';
import { ExportButtonsComponent } from '../../shared/components/export-buttons/export-buttons.component';
import { IncidentTableComponent } from '../../shared/components/incident-table/incident-table.component';

@Component({
  selector: 'app-incidents',
  standalone: true,
  imports: [
    RouterLink,
    ExportButtonsComponent,
    IncidentTableComponent,
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonIcon,
    IonMenuButton,
    IonSpinner,
    IonTitle,
    IonToolbar,
  ],
  template: `
    <ion-header class="app-header">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button aria-label="Abrir menú de navegación" />
        </ion-buttons>
        <ion-title>Incidencias</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <main tabindex="-1" class="page">
        <header class="page-header">
          <div>
            <h1>Incidencias</h1>
            <p class="subtitle">Consulta, busca y edita las incidencias registradas.</p>
          </div>
          <div class="actions">
            @if (!loading() && !error()) {
              <app-export-buttons [rows]="visible()" [filter]="{ search: search() }" />
            }
            <ion-button routerLink="/incidencias/nueva">
              <ion-icon slot="start" name="add-circle-outline" aria-hidden="true" />
              Nueva incidencia
            </ion-button>
          </div>
        </header>

        <section class="surface-card" aria-label="Listado de incidencias">
          @if (loading()) {
            <div role="status" class="state">
              <ion-spinner name="crescent" aria-hidden="true" />
              <p>Cargando incidencias…</p>
            </div>
          } @else if (error()) {
            <div role="alert" class="state error">
              <ion-icon name="alert-circle-outline" aria-hidden="true" />
              <p>{{ error() }}</p>
              <ion-button fill="outline" (click)="load()">
                <ion-icon slot="start" name="refresh-outline" aria-hidden="true" />
                Reintentar
              </ion-button>
            </div>
          } @else {
            <app-incident-table
              caption="Todas las incidencias"
              [incidents]="incidents()"
              [(search)]="search"
              (rowSelected)="open($event)"
            />
          }
        </section>
      </main>
    </ion-content>
  `,
})
export class IncidentsPage {
  private readonly api = inject(IncidentRepository);
  private readonly router = inject(Router);

  readonly incidents = signal<IncidentView[]>([]);
  readonly search = signal('');
  /** Filas que coinciden con la búsqueda de la tabla (las que se exportan). */
  readonly visible = computed(() =>
    applyIncidentFilter(this.incidents(), { ...EMPTY_FILTER, search: this.search() }),
  );
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
