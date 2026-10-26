import { Activity } from '../../models/activity.model';
import { LocalActivityFeedService } from './local-activity-feed.service';

describe('LocalActivityFeedService (NoSQL en tiempo real)', () => {
  let feed: LocalActivityFeedService;

  beforeEach(() => {
    localStorage.clear();
    feed = new LocalActivityFeedService();
  });

  afterEach(() => feed.ngOnDestroy());

  it('emite la actividad nueva a los suscriptores', async () => {
    const received: Activity[][] = [];
    const sub = feed.watch().subscribe((items) => received.push(items));

    await feed.publish({ type: 'created', incidentId: 'INC-1', message: 'Nueva incidencia', user: 'usuario' });

    expect(received.at(-1)?.[0].message).toBe('Nueva incidencia');
    sub.unsubscribe();
  });

  it('se sincroniza con los cambios hechos en otra pestaña (evento storage)', () => {
    let latest: Activity[] = [];
    const sub = feed.watch().subscribe((items) => (latest = items));

    const doc: Activity = { id: 'x', type: 'updated', incidentId: 'INC-2', message: 'Desde otra pestaña', user: 'admin', at: new Date().toISOString() };
    localStorage.setItem('incidencias360_activity', JSON.stringify([doc]));
    window.dispatchEvent(new StorageEvent('storage', { key: 'incidencias360_activity' }));

    expect(latest[0].message).toBe('Desde otra pestaña');
    sub.unsubscribe();
  });

  it('deja de emitir tras destruirse', () => {
    let completed = false;
    feed.watch().subscribe({ complete: () => (completed = true) });
    feed.ngOnDestroy();
    expect(completed).toBe(true);
  });
});
