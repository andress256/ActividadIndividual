import { Component } from '@angular/core';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Incidencias360</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <h1>Gestión de incidencias internas</h1>
      <p>La pantalla de acceso se implementará en la etapa 2.</p>
    </ion-content>
  `,
})
export class LoginPage {}
