import { Observable } from 'rxjs';
import {
  Department,
  Incident,
  IncidentView,
  NewIncident,
} from '../../models/incident.model';

/**
 * Fuente SQL de incidencias (tablas `incidents` y `departments`).
 *
 * Es una clase abstracta para inyectarla como token y elegir la
 * implementación en `app.config.ts`: Supabase (PostgreSQL) si hay
 * configuración, o la API REST simulada con JSON si no la hay.
 */
export abstract class IncidentRepository {
  /** Nombre de la implementación activa, para mostrarlo en Ayuda. */
  abstract readonly provider: string;

  /** SELECT * FROM incidents */
  abstract getIncidents(): Observable<Incident[]>;

  /** SELECT * FROM departments */
  abstract getDepartments(): Observable<Department[]>;

  /** Incidencias con el nombre del departamento (JOIN), más recientes primero. */
  abstract getIncidentViews(): Observable<IncidentView[]>;

  /** SELECT * FROM incidents WHERE id = :id */
  abstract getIncident(id: string): Observable<Incident>;

  /** INSERT INTO incidents */
  abstract create(data: NewIncident, createdBy: string): Observable<Incident>;

  /** UPDATE incidents SET ... WHERE id = :id */
  abstract update(id: string, changes: Partial<Incident>): Observable<Incident>;

  /** Comprueba si ya existe otra incidencia con ese título (sin distinguir mayúsculas). */
  abstract isTitleTaken(title: string, excludeId?: string): Observable<boolean>;
}

/** Id legible para una incidencia nueva. */
export function newIncidentId(): string {
  return `INC-${Date.now().toString(36).toUpperCase()}`;
}
