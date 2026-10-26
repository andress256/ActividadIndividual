import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { Activity } from '../../models/activity.model';
import { ActivityFeedService } from './activity-feed.service';

const STORAGE_KEY = 'incidencias360_activity';

/** Actividad sintética inicial para que el feed no esté vacío. */
function seedActivity(): Activity[] {
  const now = Date.now();
  const hour = 3600000;
  return [
    { id: 'seed-3', type: 'status-changed', incidentId: 'INC-028', message: 'Duplicados en la base de clientes pasa a En curso', user: 'tecnico1', at: new Date(now - 2 * hour).toISOString() },
    { id: 'seed-2', type: 'created', incidentId: 'INC-030', message: 'Nueva incidencia: Revisión del extintor del muelle', user: 'usuario', at: new Date(now - 5 * hour).toISOString() },
    { id: 'seed-1', type: 'updated', incidentId: 'INC-025', message: 'Se actualiza Permisos de carpeta compartida', user: 'admin', at: new Date(now - 26 * hour).toISOString() },
  ];
}

/**
 * Implementación local del feed en tiempo real, usada cuando no hay
 * configuración de Firebase. Guarda los documentos en `localStorage` y escucha
 * el evento `storage`, así que los cambios aparecen al instante en todas las
 * pestañas abiertas.
 */
@Injectable()
export class LocalActivityFeedService extends ActivityFeedService implements OnDestroy {
  readonly provider = 'Local (localStorage + RxJS)';
  private readonly state = new BehaviorSubject<Activity[]>(this.read());
  private readonly onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) this.state.next(this.read());
  };

  constructor() {
    super();
    window.addEventListener('storage', this.onStorage);
  }

  watch(limit = 20): Observable<Activity[]> {
    return this.state.pipe(map((items) => items.slice(0, limit)));
  }

  async publish(activity: Omit<Activity, 'id' | 'at'>): Promise<void> {
    const doc: Activity = {
      ...activity,
      id: crypto.randomUUID(),
      at: new Date().toISOString(),
    };
    const items = [doc, ...this.state.value].slice(0, 100);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    this.state.next(items);
  }

  ngOnDestroy(): void {
    window.removeEventListener('storage', this.onStorage);
    this.state.complete();
  }

  private read(): Activity[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as Activity[]) : seedActivity();
    } catch {
      return seedActivity();
    }
  }
}
