import { Component } from '@angular/core';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular';

@Component({
  selector: 'app-incidents',
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar],
  template: `
    <ion-header><ion-toolbar><ion-title>Incidencias</ion-title></ion-toolbar></ion-header>
    <ion-content class="ion-padding"><h1>Listado de incidencias</h1></ion-content>
  `,
})
export class IncidentsPage {}
