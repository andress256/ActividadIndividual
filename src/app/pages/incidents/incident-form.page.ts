import { Component, OnInit, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonNote,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonTextarea,
  IonTitle,
  IonToolbar,
  ToastController,
} from '@ionic/angular';
import { firstValueFrom } from 'rxjs';
import { ActivityFeedService } from '../../core/services/activity-feed.service';
import { AuthService } from '../../core/services/auth.service';
import { IncidentRepository } from '../../core/services/incident-repository';
import { uniqueTitleValidator } from '../../core/validators/unique-title.validator';
import {
  Department,
  IncidentPriority,
  IncidentStatus,
  PRIORITY_LABELS,
  STATUS_LABELS,
} from '../../models/incident.model';

/** Alta y edición de incidencias (formulario reactivo con validación asíncrona). */
@Component({
  selector: 'app-incident-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    IonBackButton,
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonIcon,
    IonInput,
    IonNote,
    IonSelect,
    IonSelectOption,
    IonSpinner,
    IonTextarea,
    IonTitle,
    IonToolbar,
  ],
  styles: `
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
      margin-top: 0.5rem;
    }
    .form-actions ion-spinner {
      width: 1.1rem;
      height: 1.1rem;
      margin-right: 0.5rem;
    }
    .alert-box {
      margin: 0 0 1rem;
    }
  `,
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/incidencias" text="Volver" />
        </ion-buttons>
        <ion-title class="desktop-hidden">{{ id() ? 'Editar incidencia' : 'Nueva incidencia' }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <main tabindex="-1" class="page-narrow">
        <header class="page-header">
          <div>
            <h1>{{ id() ? 'Editar incidencia' : 'Nueva incidencia' }}</h1>
            <p class="subtitle">
              {{ id() ? 'Código ' + id() + '. Actualiza los datos o cambia su estado.' : 'Describe el problema para que el equipo pueda resolverlo.' }}
            </p>
          </div>
        </header>

        @if (loading()) {
          <div role="status" class="surface-card state">
            <ion-spinner name="crescent" aria-hidden="true" />
            <p>Cargando…</p>
          </div>
        } @else {
          <form [formGroup]="form" (ngSubmit)="save()" novalidate class="surface-card">
            <div class="form-grid">
              <div class="full">
                <ion-input
                  fill="outline"
                  label="Título"
                  labelPlacement="stacked"
                  placeholder="Ej.: Impresora de la planta 2 sin conexión"
                  formControlName="title"
                  [counter]="true"
                  [maxlength]="80"
                  aria-describedby="title-help"
                  required
                />
              <div id="title-help" class="field-help" aria-live="polite">
                @if (form.controls.title.pending) {
                  <ion-note>Comprobando si el título ya existe…</ion-note>
                } @else if (showError('title') && form.controls.title.hasError('titleTaken')) {
                  <ion-note color="danger">Ya existe una incidencia con este título.</ion-note>
                } @else if (showError('title') && form.controls.title.hasError('required')) {
                  <ion-note color="danger">El título es obligatorio.</ion-note>
                } @else if (showError('title') && form.controls.title.hasError('minlength')) {
                  <ion-note color="danger">El título debe tener al menos 5 caracteres.</ion-note>
                }
              </div>
              </div>

              <div class="full">
                <ion-textarea
                  fill="outline"
                  label="Descripción"
                  labelPlacement="stacked"
                  placeholder="¿Qué ocurre, desde cuándo y a quién afecta?"
                  formControlName="description"
                  [autoGrow]="true"
                  [rows]="4"
                  aria-describedby="description-help"
                  required
                />
                <div id="description-help" class="field-help" aria-live="polite">
                  @if (showError('description')) {
                    <ion-note color="danger">Describe el problema con al menos 10 caracteres.</ion-note>
                  }
                </div>
              </div>

              <div class="field">
                <ion-select fill="outline" label="Prioridad" labelPlacement="stacked" formControlName="priority" interface="popover">
                  @for (option of priorities; track option.value) {
                    <ion-select-option [value]="option.value">{{ option.label }}</ion-select-option>
                  }
                </ion-select>
                <div class="field-help"></div>
              </div>

              <div class="field">
                <ion-select fill="outline" label="Departamento" labelPlacement="stacked" formControlName="departmentId" interface="popover">
                  @for (department of departments(); track department.id) {
                    <ion-select-option [value]="department.id">{{ department.name }}</ion-select-option>
                  }
                </ion-select>
                <div class="field-help"></div>
              </div>

              @if (id()) {
                <div class="field full">
                  <ion-select fill="outline" label="Estado" labelPlacement="stacked" formControlName="status" interface="popover">
                    @for (option of statuses; track option.value) {
                      <ion-select-option [value]="option.value">{{ option.label }}</ion-select-option>
                    }
                  </ion-select>
                  <div class="field-help"></div>
                </div>
              }
            </div>

            @if (error()) {
              <p role="alert" class="alert-box">
                <ion-icon name="alert-circle-outline" aria-hidden="true" />
                {{ error() }}
              </p>
            }

            <div class="form-actions">
              <ion-button fill="clear" routerLink="/incidencias">Cancelar</ion-button>
              <ion-button type="submit" [disabled]="form.invalid || form.pending || saving()">
                @if (saving()) {
                  <ion-spinner name="crescent" aria-hidden="true" />
                  Guardando…
                } @else {
                  <ion-icon slot="start" name="checkmark-circle-outline" aria-hidden="true" />
                  Guardar incidencia
                }
              </ion-button>
            </div>
          </form>
        }
      </main>
    </ion-content>
  `,
})
export class IncidentFormPage implements OnInit {
  /** Id de la ruta `/incidencias/:id` (vinculado con withComponentInputBinding). */
  readonly id = input<string>();

  private readonly fb = inject(FormBuilder);
  private readonly api = inject(IncidentRepository);
  private readonly feed = inject(ActivityFeedService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastController);

  readonly priorities = Object.entries(PRIORITY_LABELS).map(([value, label]) => ({ value, label }));
  readonly statuses = Object.entries(STATUS_LABELS).map(([value, label]) => ({ value, label }));
  readonly departments = signal<Department[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal('');

  readonly form = this.fb.nonNullable.group({
    title: [
      '',
      {
        validators: [Validators.required, Validators.minLength(5)],
        asyncValidators: [uniqueTitleValidator(this.api, () => this.id())],
      },
    ],
    description: ['', [Validators.required, Validators.minLength(10)]],
    priority: ['medium' as IncidentPriority, Validators.required],
    departmentId: [1, Validators.required],
    status: ['open' as IncidentStatus],
  });

  async ngOnInit(): Promise<void> {
    try {
      this.departments.set(await firstValueFrom(this.api.getDepartments()));
      const id = this.id();
      if (id) {
        const incident = await firstValueFrom(this.api.getIncident(id));
        this.form.patchValue(incident);
      }
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'No se pudieron cargar los datos.');
    } finally {
      this.loading.set(false);
    }
  }

  showError(control: 'title' | 'description'): boolean {
    const c = this.form.controls[control];
    return c.invalid && (c.dirty || c.touched);
  }

  async save(): Promise<void> {
    if (this.form.invalid || this.form.pending) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    this.error.set('');
    const user = this.auth.user()?.username ?? 'desconocido';
    const { status, ...data } = this.form.getRawValue();

    try {
      const id = this.id();
      if (id) {
        await firstValueFrom(this.api.update(id, { ...data, status }));
        await this.feed.publish({ type: 'updated', incidentId: id, message: `Se actualiza ${data.title}`, user });
      } else {
        const created = await firstValueFrom(this.api.create(data, user));
        await this.feed.publish({ type: 'created', incidentId: created.id, message: `Nueva incidencia: ${data.title}`, user });
      }
      const toast = await this.toast.create({ message: 'Incidencia guardada.', duration: 2500, color: 'success' });
      await toast.present();
      await this.router.navigateByUrl('/incidencias');
    } catch {
      this.error.set('No se pudo guardar la incidencia. Inténtalo de nuevo.');
    } finally {
      this.saving.set(false);
    }
  }
}
