import { Injectable } from '@angular/core';
import { Observable, from, switchMap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Activity } from '../../models/activity.model';
import { ActivityFeedService } from './activity-feed.service';

/**
 * Feed en tiempo real sobre Firebase Firestore (colección `activity`).
 *
 * El SDK de Firebase se carga con `import()` dinámico, así que solo se
 * descarga cuando hay configuración y no aumenta el bundle inicial.
 */
@Injectable()
export class FirestoreActivityFeedService extends ActivityFeedService {
  readonly provider = 'Firebase Firestore';
  private db?: Promise<import('firebase/firestore').Firestore>;

  watch(limit = 20): Observable<Activity[]> {
    return from(this.firestore()).pipe(
      switchMap(
        (db) =>
          new Observable<Activity[]>((subscriber) => {
            let unsubscribe: (() => void) | undefined;
            import('firebase/firestore').then(({ collection, onSnapshot, orderBy, query, limit: max }) => {
              if (subscriber.closed) return;
              unsubscribe = onSnapshot(
                query(collection(db, 'activity'), orderBy('at', 'desc'), max(limit)),
                (snapshot) =>
                  subscriber.next(
                    snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Activity),
                  ),
                (error) => subscriber.error(error),
              );
            });
            // Se cancela la escucha de Firestore al desuscribirse (evita fugas de memoria).
            return () => unsubscribe?.();
          }),
      ),
    );
  }

  async publish(activity: Omit<Activity, 'id' | 'at'>): Promise<void> {
    const db = await this.firestore();
    const { addDoc, collection } = await import('firebase/firestore');
    await addDoc(collection(db, 'activity'), { ...activity, at: new Date().toISOString() });
  }

  private firestore() {
    this.db ??= Promise.all([import('firebase/app'), import('firebase/firestore')]).then(
      ([{ initializeApp }, { getFirestore }]) => getFirestore(initializeApp(environment.firebase)),
    );
    return this.db;
  }
}
