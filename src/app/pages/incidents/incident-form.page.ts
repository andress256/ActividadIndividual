import { Component, OnInit, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonList,
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
import { IncidentApiService } from '../../core/services/incident-api.service';
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
    IonBackButton,
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonInput,
    IonItem,
    IonList,
    IonNote,
    IonSelect,
    IonSelectOption,
    IonSpinner,
    IonTextarea,
    IonTitle,
    IonToolbar,
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/incidencias" text="Volver" />
        </ion-buttons>
        <ion-title>{{ id() ? 'Editar incidencia' : 'Nueva incidencia' }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <main id="main-content" class="page-narrow">
        <h1>{{ id() ? 'Editar ' + id() : 'Registrar una incidencia' }}</h1>

        @if (loading()) {
          <p role="status"><ion-spinner name="crescent" aria-hidden="true" /> Cargando…</p>
        } @else {
          <form [formGroup]="form" (ngSubmit)="save()" novalidate>
            <ion-list lines="full">
              <ion-item>
                <ion-input
                  label="Título"
                  labelPlacement="stacked"
                  formControlName="title"
                  [counter]="true"
                  [maxlength]="80"
                  aria-describedby="title-help"
                  required
                />
              </ion-item>
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

              <ion-item>
                <ion-textarea
                  label="Descripción"
                  labelPlacement="stacked"
                  formControlName="description"
                  [autoGrow]="true"
                  aria-describedby="description-help"
                  required
                />
              </ion-item>
              <div id="description-help" class="field-help" aria-live="polite">
                @if (showError('description')) {
                  <ion-note color="danger">Describe el problema con al menos 10 caracteres.</ion-note>
                }
              </div>

              <ion-item>
                <ion-select label="Prioridad" labelPlacement="stacked" formControlName="priority" interface="popover">
                  @for (option of priorities; track option.value) {
                    <ion-select-option [value]="option.value">{{ option.label }}</ion-select-option>
                  }
                </ion-select>
              </ion-item>

              <ion-item>
                <ion-select label="Departamento" labelPlacement="stacked" formControlName="departmentId" interface="popover">
                  @for (department of departments(); track department.id) {
                    <ion-select-option [value]="department.id">{{ department.name }}</ion-select-option>
                  }
                </ion-select>
              </ion-item>

              @if (id()) {
                <ion-item>
                  <ion-select label="Estado" labelPlacement="stacked" formControlName="status" interface="popover">
                    @for (option of statuses; track option.value) {
                      <ion-select-option [value]="option.value">{{ option.label }}</ion-select-option>
                    }
                  </ion-select>
                </ion-item>
              }
            </ion-list>

            <p role="alert" class="form-error">{{ error() }}</p>

            <ion-button type="submit" expand="block" [disabled]="form.invalid || form.pending || saving()">
              {{ saving() ? 'Guardando…' : 'Guardar incidencia' }}
            </ion-button>
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
  private readonly api = inject(IncidentApiService);
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
