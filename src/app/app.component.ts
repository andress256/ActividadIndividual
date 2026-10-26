import { Component, DestroyRef, computed, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import {
  IonApp,
  IonButton,
  IonContent,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonMenu,
  IonMenuToggle,
  IonRouterOutlet,
  IonSplitPane,
} from '@ionic/angular';
import { filter, skip } from 'rxjs';
import { AuthService } from './core/services/auth.service';

/** Selector del contenido principal de la página visible (Ionic mantiene en el DOM las páginas anteriores). */
const VISIBLE_MAIN = '.ion-page:not(.ion-page-hidden) main';

interface NavLink {
  url: string;
  label: string;
  icon: string;
  exact: boolean;
  adminOnly?: boolean;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    IonApp,
    IonButton,
    IonContent,
    IonIcon,
    IonItem,
    IonLabel,
    IonList,
    IonMenu,
    IonMenuToggle,
    IonRouterOutlet,
    IonSplitPane,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly currentUser = this.auth.user;

  private readonly links: NavLink[] = [
    { url: '/dashboard', label: 'Cuadro de mando', icon: 'grid-outline', exact: true, adminOnly: true },
    { url: '/incidencias', label: 'Incidencias', icon: 'list-outline', exact: true },
    { url: '/incidencias/nueva', label: 'Nueva incidencia', icon: 'add-circle-outline', exact: true },
    { url: '/ayuda', label: 'Ayuda', icon: 'help-circle-outline', exact: true },
  ];

  /** Enlaces visibles según el rol del usuario. */
  readonly navLinks = computed(() => {
    const isAdmin = this.currentUser()?.role === 'admin';
    return this.links.filter((link) => !link.adminOnly || isAdmin);
  });

  /** Iniciales para el avatar. */
  readonly initials = computed(() => this.currentUser()?.username.slice(0, 2).toUpperCase() ?? '');

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
