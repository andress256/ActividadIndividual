import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonButton,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    IonButton,
    IonContent,
    IonHeader,
    IonInput,
    IonItem,
    IonTitle,
    IonToolbar,
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Iniciar sesión</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <main tabindex="-1" class="page-narrow">
      <h1>Incidencias360</h1>
      <p>Accede con tu usuario para gestionar las incidencias internas.</p>
      <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
        <ion-item>
          <ion-input
            label="Usuario"
            labelPlacement="stacked"
            formControlName="username"
            autocomplete="username"
            required
          />
        </ion-item>

        <ion-item>
          <ion-input
            label="Contraseña"
            labelPlacement="stacked"
            type="password"
            formControlName="password"
            autocomplete="current-password"
            required
          />
        </ion-item>

        <ion-button expand="block" type="submit" [disabled]="form.invalid || busy()">
          {{ busy() ? 'Validando…' : 'Entrar' }}
        </ion-button>

        <p aria-live="polite" role="status">{{ message() }}</p>
      </form>
      </main>
    </ion-content>
  `,
})
export class LoginPage {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly form = this.fb.nonNullable.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });

  readonly busy = signal(false);
  readonly message = signal('');

  async submit(): Promise<void> {
    this.message.set('');
    if (this.form.invalid || this.busy()) {
      this.form.markAllAsTouched();
      return;
    }

    this.busy.set(true);
    const { username, password } = this.form.getRawValue();

    try {
      const valid = await this.auth.login(username, password);
      if (!valid) {
        this.message.set('Usuario o contraseña incorrectos.');
        return;
      }

      const home = this.auth.hasRole('admin') ? '/dashboard' : '/incidencias';
      const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
      const safeReturnUrl =
        returnUrl?.startsWith('/') && !returnUrl.startsWith('//') ? returnUrl : home;

      await this.router.navigateByUrl(safeReturnUrl);
    } catch {
      this.message.set('No se pudo validar el acceso en este navegador.');
    } finally {
      this.busy.set(false);
    }
  }
}
