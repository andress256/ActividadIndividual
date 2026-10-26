import { Component } from '@angular/core';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar],
  template: `
    <ion-header><ion-toolbar><ion-title>Administración</ion-title></ion-toolbar></ion-header>
    <ion-content class="ion-padding"><h1>Área de administración</h1></ion-content>
  `,
})
export class AdminPage {}
