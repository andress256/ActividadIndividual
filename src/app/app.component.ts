import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import {
  IonApp,
  IonButton,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonMenu,
  IonMenuToggle,
  IonRouterOutlet,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';
import { filter, skip } from 'rxjs';
import { AuthService } from './core/services/auth.service';

/** Selector del contenido principal de la página visible (Ionic mantiene en el DOM las páginas anteriores). */
const VISIBLE_MAIN = '.ion-page:not(.ion-page-hidden) main';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    IonApp,
    IonButton,
    IonContent,
    IonHeader,
    IonItem,
    IonLabel,
    IonList,
    IonMenu,
    IonMenuToggle,
    IonRouterOutlet,
    IonTitle,
    IonToolbar,
  ],
  template: `
    <a class="skip-link" href="#" (click)="skipToContent($event)">Saltar al contenido principal</a>

    <ion-app>
      <ion-menu contentId="app-outlet" menuId="main-menu">
        <ion-header>
          <ion-toolbar><ion-title>Incidencias360</ion-title></ion-toolbar>
        </ion-header>
        <ion-content>
          <nav aria-label="Navegación principal">
            <ion-list>
              @if (currentUser(); as user) {
                <ion-menu-toggle [autoHide]="false">
                  @if (user.role === 'admin') {
                    <ion-item routerLink="/dashboard" routerLinkActive="active-link" [routerLinkActiveOptions]="{ exact: true }">
                      <ion-label>Cuadro de mando</ion-label>
                    </ion-item>
                  }
                  <ion-item routerLink="/incidencias" routerLinkActive="active-link" [routerLinkActiveOptions]="{ exact: true }">
                    <ion-label>Incidencias</ion-label>
                  </ion-item>
                  <ion-item routerLink="/incidencias/nueva" routerLinkActive="active-link">
                    <ion-label>Nueva incidencia</ion-label>
                  </ion-item>
                  <ion-item routerLink="/ayuda" routerLinkActive="active-link">
                    <ion-label>Ayuda</ion-label>
                  </ion-item>
                </ion-menu-toggle>
                <ion-item lines="none">
                  <ion-label>
                    <p>Sesión iniciada como</p>
                    <h2>{{ user.username }} ({{ user.role === 'admin' ? 'Administrador' : 'Usuario estándar' }})</h2>
                  </ion-label>
                </ion-item>
                <ion-menu-toggle [autoHide]="false">
                  <ion-button expand="block" fill="outline" class="ion-margin" (click)="logout()">Cerrar sesión</ion-button>
                </ion-menu-toggle>
              } @else {
                <ion-menu-toggle [autoHide]="false">
                  <ion-item routerLink="/login"><ion-label>Iniciar sesión</ion-label></ion-item>
                  <ion-item routerLink="/ayuda"><ion-label>Ayuda</ion-label></ion-item>
                </ion-menu-toggle>
              }
            </ion-list>
          </nav>
        </ion-content>
      </ion-menu>

      <ion-router-outlet id="app-outlet" />
    </ion-app>
  `,
})
export class AppComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly currentUser = this.auth.user;

  constructor() {
    // Tras cada navegación se lleva el foco al contenido nuevo, para que el
    // lector de pantalla anuncie la página y el teclado empiece desde ahí.
    // La carga inicial se omite: así el primer Tab llega al enlace "Saltar al contenido".
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        skip(1),
        takeUntilDestroyed(inject(DestroyRef)),
      )
      .subscribe(() => setTimeout(() => this.focusMain(), 400));
  }

  skipToContent(event: Event): void {
    event.preventDefault();
    this.focusMain();
  }

  logout(): void {
    this.auth.logout();
  }

  private focusMain(): void {
    const main = document.querySelector<HTMLElement>(VISIBLE_MAIN);
    main?.focus({ preventScroll: true });
  }
}
