import { Observable } from 'rxjs';
import { Activity } from '../../models/activity.model';

/**
 * Fuente NoSQL en tiempo real: colección de documentos `activity`.
 *
 * Es una clase abstracta para poder inyectarla como token y cambiar la
 * implementación (Firestore o local) sin tocar las vistas.
 */
export abstract class ActivityFeedService {
  /** Nombre de la implementación activa, para mostrarlo en Ayuda. */
  abstract readonly provider: string;

  /** Emite la lista de actividad (más reciente primero) cada vez que cambia. */
  abstract watch(limit?: number): Observable<Activity[]>;

  /** Añade un documento a la colección. */
  abstract publish(activity: Omit<Activity, 'id' | 'at'>): Promise<void>;
}
