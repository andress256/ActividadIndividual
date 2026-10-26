import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  IonButton,
  IonContent,
  IonIcon,
  IonInput,
  IonInputPasswordToggle,
  IonSpinner,
} from '@ionic/angular';
import { homeUrl } from '../../../core/guards/auth.guards';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    IonButton,
    IonContent,
    IonIcon,
    IonInput,
    IonInputPasswordToggle,
    IonSpinner,
  ],
  templateUrl: './login.page.html',
  styleUrl: './login.page.scss',
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

  readonly features = [
    { icon: 'bar-chart-outline', text: 'Cuadro de mando con métricas y gráficos' },
    { icon: 'pulse-outline', text: 'Actividad en tiempo real' },
    { icon: 'document-text-outline', text: 'Informes en PDF y CSV' },
    { icon: 'shield-checkmark-outline', text: 'Acceso por roles' },
  ];

  readonly busy = signal(false);
  readonly message = signal('');

  showError(control: 'username' | 'password'): boolean {
    const c = this.form.controls[control];
    return c.invalid && c.touched;
  }

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

      // Se respeta la página que el usuario intentaba abrir; si no, su página de inicio.
      const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
      const safeReturnUrl =
        returnUrl?.startsWith('/') && !returnUrl.startsWith('//') ? returnUrl : homeUrl(this.auth);

      await this.router.navigateByUrl(safeReturnUrl);
      this.form.reset();
    } catch {
      this.message.set('No se pudo validar el acceso en este navegador.');
    } finally {
      this.busy.set(false);
    }
  }
}
