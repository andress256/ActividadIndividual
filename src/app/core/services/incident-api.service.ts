import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, delay, forkJoin, map, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Department,
  Incident,
  IncidentView,
  NewIncident,
} from '../../models/incident.model';
import { IncidentRepository, newIncidentId } from './incident-repository';

const OVERLAY_KEY = 'incidencias360_sql_overlay';

/** Cambios locales sobre los datos de solo lectura de la API simulada. */
interface Overlay {
  created: Incident[];
  updated: Record<string, Partial<Incident>>;
}

/**
 * API REST simulada (alternativa cuando no hay Supabase configurado).
 *
 * Las lecturas se hacen por HTTP contra `environment.apiBaseUrl`, que apunta a
 * un mock JSON con las tablas `incidents` y `departments`. Las escrituras se
 * simulan guardando los cambios en `localStorage`.
 */
@Injectable()
export class IncidentApiService extends IncidentRepository {
  readonly provider = 'API REST simulada (JSON + localStorage)';
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;
  /** Latencia simulada (ms) para que se aprecien los estados de carga. */
  static latency = 400;

  /** GET /incidents */
  getIncidents(): Observable<Incident[]> {
    return this.http.get<Incident[]>(`${this.baseUrl}/incidents.json`).pipe(
      map((rows) => this.applyOverlay(rows)),
      delay(IncidentApiService.latency),
    );
  }

  /** GET /departments */
  getDepartments(): Observable<Department[]> {
    return this.http
      .get<Department[]>(`${this.baseUrl}/departments.json`)
      .pipe(delay(IncidentApiService.latency));
  }

  /**
   * Equivalente a `SELECT i.*, d.name FROM incidents i JOIN departments d`.
   * Las dos peticiones se lanzan en paralelo con `forkJoin`.
   */
  getIncidentViews(): Observable<IncidentView[]> {
    return forkJoin({
      incidents: this.getIncidents(),
      departments: this.getDepartments(),
    }).pipe(
      map(({ incidents, departments }) => {
        const names = new Map(departments.map((d) => [d.id, d.name]));
        return incidents
          .map((incident) => ({
            ...incident,
            departmentName: names.get(incident.departmentId) ?? 'Sin departamento',
          }))
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      }),
    );
  }

  /** GET /incidents/:id */
  getIncident(id: string): Observable<Incident> {
    return this.getIncidents().pipe(
      map((rows) => {
        const found = rows.find((row) => row.id === id);
        if (!found) throw new Error(`No existe la incidencia ${id}.`);
        return found;
      }),
    );
  }

  /** POST /incidents */
  create(data: NewIncident, createdBy: string): Observable<Incident> {
    const incident: Incident = {
      ...data,
      id: newIncidentId(),
      status: 'open',
      createdAt: new Date().toISOString(),
      createdBy,
    };
    const overlay = this.readOverlay();
    overlay.created.push(incident);
    this.writeOverlay(overlay);
    return of(incident).pipe(delay(IncidentApiService.latency));
  }

  /** PATCH /incidents/:id */
  update(id: string, changes: Partial<Incident>): Observable<Incident> {
    const overlay = this.readOverlay();
    const created = overlay.created.find((row) => row.id === id);
    if (created) {
      Object.assign(created, changes);
    } else {
      overlay.updated[id] = { ...overlay.updated[id], ...changes };
    }
    this.writeOverlay(overlay);
    return this.getIncident(id);
  }

  /**
   * Comprueba en el servidor si ya existe una incidencia con ese título
   * (sin distinguir mayúsculas). Se usa en la validación asíncrona.
   */
  isTitleTaken(title: string, excludeId?: string): Observable<boolean> {
    const normalized = title.trim().toLowerCase();
    if (!normalized) return of(false);
    return this.getIncidents().pipe(
      map((rows) =>
        rows.some(
          (row) => row.id !== excludeId && row.title.trim().toLowerCase() === normalized,
        ),
      ),
    );
  }

  /** Borra los cambios locales y vuelve a los datos originales de la API. */
  resetLocalChanges(): void {
    localStorage.removeItem(OVERLAY_KEY);
  }

  private applyOverlay(rows: Incident[]): Incident[] {
    if (!Array.isArray(rows)) {
      throw new Error('Respuesta de la API no válida.');
    }
    const overlay = this.readOverlay();
    return [
      ...rows.map((row) => ({ ...row, ...overlay.updated[row.id] })),
      ...overlay.created,
    ];
  }

  private readOverlay(): Overlay {
    try {
      const raw = localStorage.getItem(OVERLAY_KEY);
      const parsed = raw ? (JSON.parse(raw) as Overlay) : null;
      return {
        created: parsed?.created ?? [],
        updated: parsed?.updated ?? {},
      };
    } catch {
      return { created: [], updated: {} };
    }
  }

  private writeOverlay(overlay: Overlay): void {
    localStorage.setItem(OVERLAY_KEY, JSON.stringify(overlay));
  }
}
