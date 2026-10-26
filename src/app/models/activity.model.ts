export type ActivityType = 'created' | 'updated' | 'status-changed';

/** Documento de la colección NoSQL `activity` (feed en tiempo real). */
export interface Activity {
  id: string;
  type: ActivityType;
  incidentId: string;
  message: string;
  user: string;
  /** Fecha ISO 8601. */
  at: string;
}
