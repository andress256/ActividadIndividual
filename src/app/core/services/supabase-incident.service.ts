import { Injectable } from '@angular/core';
import type { SupabaseClient } from '@supabase/supabase-js';
import { Observable, defer, from, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Department,
  Incident,
  IncidentView,
  NewIncident,
} from '../../models/incident.model';
import { IncidentRepository, newIncidentId } from './incident-repository';

/** Fila de la tabla `incidents` tal como la devuelve PostgreSQL. */
export interface IncidentRow {
  id: string;
  title: string;
  description: string;
  status: Incident['status'];
  priority: Incident['priority'];
  department_id: number;
  created_at: string;
  created_by: string;
  /** Presente cuando se hace JOIN con `departments`. */
  departments?: { name: string } | null;
}

/** Columnas de `incidents` + nombre del departamento (JOIN por clave foránea). */
const SELECT_WITH_DEPARTMENT = '*, departments(name)';

export function toIncident(row: IncidentRow): Incident {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    status: row.status,
    priority: row.priority,
    departmentId: row.department_id,
    createdAt: row.created_at,
    createdBy: row.created_by,
  };
}

export function toIncidentView(row: IncidentRow): IncidentView {
  return { ...toIncident(row), departmentName: row.departments?.name ?? 'Sin departamento' };
}

/** Convierte un cambio parcial del modelo a columnas de la tabla. */
export function toRow(changes: Partial<Incident>): Partial<IncidentRow> {
  const row: Partial<IncidentRow> = {};
  if (changes.title !== undefined) row.title = changes.title.trim();
  if (changes.description !== undefined) row.description = changes.description;
  if (changes.status !== undefined) row.status = changes.status;
  if (changes.priority !== undefined) row.priority = changes.priority;
  if (changes.departmentId !== undefined) row.department_id = changes.departmentId;
  return row;
}

/** Escapa los comodines de LIKE para buscar el texto literal. */
export function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (char) => `\\${char}`);
}

/**
 * Fuente SQL real: PostgreSQL en Supabase, a través de su API REST
 * (PostgREST) con el cliente `@supabase/supabase-js`.
 *
 * El SDK se carga con `import()` dinámico para no aumentar el bundle inicial.
 */
@Injectable()
export class SupabaseIncidentService extends IncidentRepository {
  readonly provider = 'Supabase (PostgreSQL)';
  private client?: Promise<SupabaseClient>;

  getIncidents(): Observable<Incident[]> {
    return this.query(async (db) => {
      const { data, error } = await db.from('incidents').select('*');
      if (error) throw error;
      return (data as IncidentRow[]).map(toIncident);
    });
  }

  getDepartments(): Observable<Department[]> {
    return this.query(async (db) => {
      const { data, error } = await db.from('departments').select('id, name').order('id');
      if (error) throw error;
      return data as Department[];
    });
  }

  getIncidentViews(): Observable<IncidentView[]> {
    return this.query(async (db) => {
      const { data, error } = await db
        .from('incidents')
        .select(SELECT_WITH_DEPARTMENT)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data as IncidentRow[]).map(toIncidentView);
    });
  }

  getIncident(id: string): Observable<Incident> {
    return this.query(async (db) => {
      const { data, error } = await db.from('incidents').select('*').eq('id', id).single();
      if (error) throw error;
      return toIncident(data as IncidentRow);
    });
  }

  create(data: NewIncident, createdBy: string): Observable<Incident> {
    return this.query(async (db) => {
      const row = {
        ...toRow(data),
        id: newIncidentId(),
        status: 'open',
        created_by: createdBy,
      };
      const { data: inserted, error } = await db.from('incidents').insert(row).select().single();
      if (error) throw error;
      return toIncident(inserted as IncidentRow);
    });
  }

  update(id: string, changes: Partial<Incident>): Observable<Incident> {
    return this.query(async (db) => {
      const { data, error } = await db
        .from('incidents')
        .update(toRow(changes))
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return toIncident(data as IncidentRow);
    });
  }

  isTitleTaken(title: string, excludeId?: string): Observable<boolean> {
    const value = title.trim();
    if (!value) return from([false]);
    return this.query(async (db) => {
      // ILIKE sin comodines = comparación exacta sin distinguir mayúsculas.
      let request = db
        .from('incidents')
        .select('id', { count: 'exact', head: true })
        .ilike('title', escapeLike(value));
      if (excludeId) request = request.neq('id', excludeId);
      const { count, error } = await request;
      if (error) throw error;
      return (count ?? 0) > 0;
    }).pipe(map(Boolean));
  }

  /** Ejecuta una consulta de forma perezosa (se lanza al suscribirse). */
  private query<T>(run: (db: SupabaseClient) => Promise<T>): Observable<T> {
    return defer(() => from(this.db().then(run)));
  }

  private db(): Promise<SupabaseClient> {
    this.client ??= import('@supabase/supabase-js').then(({ createClient }) =>
      createClient(environment.supabase.url, environment.supabase.anonKey, {
        auth: { persistSession: false },
      }),
    );
    return this.client;
  }
}
