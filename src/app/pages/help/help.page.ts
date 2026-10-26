import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  IonAccordion,
  IonAccordionGroup,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonMenuButton,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';
import { ActivityFeedService } from '../../core/services/activity-feed.service';
import { AuthService } from '../../core/services/auth.service';
import { IncidentRepository } from '../../core/services/incident-repository';

/** Manual de usuario integrado en la aplicación. */
@Component({
  selector: 'app-help',
  standalone: true,
  imports: [
    RouterLink,
    IonAccordion,
    IonAccordionGroup,
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonIcon,
    IonItem,
    IonLabel,
    IonMenuButton,
    IonTitle,
    IonToolbar,
  ],
  templateUrl: './help.page.html',
  styleUrl: './help.page.scss',
})
export class HelpPage {
  readonly user = inject(AuthService).user;
  readonly provider = inject(ActivityFeedService).provider;
  readonly sqlProvider = inject(IncidentRepository).provider;
}
