import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
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
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterLink,
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
    <ion-app>
      <ion-menu contentId="main-content">
        <ion-header>
          <ion-toolbar><ion-title>Incidencias360</ion-title></ion-toolbar>
        </ion-header>
        <ion-content>
          <ion-list>
            @if (currentUser(); as user) {
              <ion-menu-toggle>
                @if (user.role === 'admin') {
                  <ion-item routerLink="/dashboard"><ion-label>Cuadro de mando</ion-label></ion-item>
                }
                <ion-item routerLink="/incidencias"><ion-label>Incidencias</ion-label></ion-item>
                <ion-item routerLink="/incidencias/nueva"><ion-label>Nueva incidencia</ion-label></ion-item>
              </ion-menu-toggle>
              <ion-item>
                <ion-label>{{ user.username }} ({{ user.role }})</ion-label>
              </ion-item>
              <ion-button expand="block" (click)="logout()">Cerrar sesión</ion-button>
            } @else {
              <ion-menu-toggle>
                <ion-item routerLink="/login"><ion-label>Iniciar sesión</ion-label></ion-item>
              </ion-menu-toggle>
            }
          </ion-list>
        </ion-content>
      </ion-menu>

      <ion-router-outlet id="main-content" />
    </ion-app>
  `,
})
export class AppComponent {
  private readonly auth = inject(AuthService);

  readonly currentUser = this.auth.user;

  logout(): void {
    this.auth.logout();
  }
}
