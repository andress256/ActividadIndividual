import { ApplicationConfig } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  PreloadAllModules,
  RouteReuseStrategy,
  provideRouter,
  withComponentInputBinding,
  withPreloading,
} from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { ActivityFeedService } from './core/services/activity-feed.service';
import { FirestoreActivityFeedService } from './core/services/firestore-activity-feed.service';
import { IncidentApiService } from './core/services/incident-api.service';
import { IncidentRepository } from './core/services/incident-repository';
import { SupabaseIncidentService } from './core/services/supabase-incident.service';
import { LocalActivityFeedService } from './core/services/local-activity-feed.service';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    // Sin animaciones de transición si el usuario ha pedido reducir el movimiento.
    provideIonicAngular({
      animated: !matchMedia('(prefers-reduced-motion: reduce)').matches,
    }),
    provideRouter(routes, withPreloading(PreloadAllModules), withComponentInputBinding()),
    provideHttpClient(withInterceptors([authInterceptor])),
    // Fuente SQL: Supabase (PostgreSQL) si hay configuración, si no la API REST simulada.
    {
      provide: IncidentRepository,
      useClass:
        environment.supabase.url && environment.supabase.anonKey
          ? SupabaseIncidentService
          : IncidentApiService,
    },
    // Fuente NoSQL: Firestore si hay configuración, si no la implementación local.
    {
      provide: ActivityFeedService,
      useClass: environment.firebase.projectId
        ? FirestoreActivityFeedService
        : LocalActivityFeedService,
    },
  ],
};
