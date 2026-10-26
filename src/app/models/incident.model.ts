export type IncidentStatus = 'open' | 'in-progress' | 'closed';
export type IncidentPriority = 'low' | 'medium' | 'high';

/** Fila de la tabla `incidents` de la API REST relacional. */
export interface Incident {
  id: string;
  title: string;
  description: string;
  status: IncidentStatus;
  priority: IncidentPriority;
  /** Clave foránea a `departments.id`. */
  departmentId: number;
  createdAt: string;
  createdBy: string;
}

/** Fila de la tabla `departments`. */
export interface Department {
  id: number;
  name: string;
}

/** Resultado del JOIN entre `incidents` y `departments`. */
export interface IncidentView extends Incident {
  departmentName: string;
}

/** Datos que el usuario introduce al crear una incidencia. */
export type NewIncident = Pick<Incident, 'title' | 'description' | 'priority' | 'departmentId'>;

export const STATUS_LABELS: Record<IncidentStatus, string> = {
  open: 'Abierta',
  'in-progress': 'En curso',
  closed: 'Cerrada',
};

export const PRIORITY_LABELS: Record<IncidentPriority, string> = {
  low: 'Baja',
  medium: 'Media',
  high: 'Alta',
};
