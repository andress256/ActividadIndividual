import { DatePipe } from '@angular/common';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonButton,
  IonButtons,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonInput,
  IonMenuButton,
  IonRow,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';
import { Subscription, forkJoin, skip, switchMap, take, tap } from 'rxjs';
import { ActivityFeedService } from '../../core/services/activity-feed.service';
import { IncidentRepository } from '../../core/services/incident-repository';
import { Activity } from '../../models/activity.model';
import { IncidentFilter, applyIncidentFilter } from '../../models/incident-filter.model';
import {
  IncidentPriority,
  IncidentStatus,
  IncidentView,
  PRIORITY_LABELS,
  STATUS_LABELS,
} from '../../models/incident.model';
import { ChartWidgetComponent } from '../../shared/components/chart-widget/chart-widget.component';
import { ExportButtonsComponent } from '../../shared/components/export-buttons/export-buttons.component';
import { IncidentTableComponent } from '../../shared/components/incident-table/incident-table.component';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';

const STATUSES: IncidentStatus[] = ['open', 'in-progress', 'closed'];
const PRIORITIES: IncidentPriority[] = ['high', 'medium', 'low'];

/** Cuadro de mando del administrador. */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    DatePipe,
    FormsModule,
    ChartWidgetComponent,
    ExportButtonsComponent,
    IncidentTableComponent,
    StatCardComponent,
    IonButton,
    IonButtons,
    IonCol,
    IonContent,
    IonGrid,
    IonHeader,
    IonInput,
    IonMenuButton,
    IonRow,
    IonSelect,
    IonSelectOption,
    IonSpinner,
    IonTitle,
    IonToolbar,
  ],
  templateUrl: './dashboard.page.html',
  styleUrl: './dashboard.page.scss',
})
export class DashboardPage implements OnInit {
  private readonly api = inject(IncidentRepository);
  private readonly feed = inject(ActivityFeedService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private live?: Subscription;

  readonly statusLabels = STATUS_LABELS;
  readonly priorityLabels = PRIORITY_LABELS;
  readonly statuses = STATUSES;
  readonly priorities = PRIORITIES;
  readonly provider = this.feed.provider;

  readonly incidents = signal<IncidentView[]>([]);
  readonly activity = signal<Activity[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');

  // Filtros (enlazados con [(ngModel)]).
  readonly search = signal('');
  readonly status = signal<IncidentFilter['status']>('all');
  readonly priority = signal<IncidentFilter['priority']>('all');
  readonly from = signal('');
  readonly to = signal('');

  readonly filter = computed<IncidentFilter>(() => ({
    search: this.search(),
    status: this.status(),
    priority: this.priority(),
    from: this.from(),
    to: this.to(),
  }));

  readonly filtered = computed(() => applyIncidentFilter(this.incidents(), this.filter()));

  /** Igual que `filtered` pero sin el filtro de estado (para las tarjetas). */
  private readonly withoutStatus = computed(() =>
    applyIncidentFilter(this.incidents(), { ...this.filter(), status: 'all' }),
  );

  readonly statusCounts = computed(() =>
    STATUSES.map((s) => this.withoutStatus().filter((i) => i.status === s).length),
  );

  readonly priorityCounts = computed(() =>
    PRIORITIES.map((p) => this.filtered().filter((i) => i.priority === p).length),
  );

  /** Incidencias creadas por mes (últimos 6 meses con datos). */
  readonly monthly = computed(() => {
    const counts = new Map<string, number>();
    for (const incident of this.filtered()) {
      const month = incident.createdAt.slice(0, 7);
      counts.set(month, (counts.get(month) ?? 0) + 1);
    }
    const months = [...counts.keys()].sort().slice(-6);
    return {
      labels: months.map((m) => {
        const [year, month] = m.split('-').map(Number);
        return new Date(year, month - 1).toLocaleDateString('es-ES', { month: 'short', year: '2-digit' });
      }),
      values: months.map((m) => counts.get(m) ?? 0),
    };
  });

  readonly statusChartLabels = STATUSES.map((s) => STATUS_LABELS[s]);
  readonly priorityChartLabels = PRIORITIES.map((p) => PRIORITY_LABELS[p]);
  readonly statusColors = ['var(--app-status-open)', 'var(--app-status-progress)', 'var(--app-status-closed)'];
  readonly priorityColors = ['var(--app-priority-high)', 'var(--app-priority-medium)', 'var(--app-priority-low)'];

  ngOnInit(): void {
    this.load();
  }

  /**
   * Carga concurrente de las dos fuentes con `forkJoin`: la API REST (SQL) y
   * el feed de actividad (NoSQL). Después se queda escuchando el feed en
   * tiempo real y recarga las incidencias cuando llega un cambio.
   */
  load(): void {
    this.loading.set(true);
    this.error.set('');
    this.live?.unsubscribe();

    forkJoin({
      incidents: this.api.getIncidentViews(),
      activity: this.feed.watch(8).pipe(take(1)),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ incidents, activity }) => {
          this.incidents.set(incidents);
          this.activity.set(activity);
          this.loading.set(false);
          this.listen();
        },
        error: () => {
          this.error.set('No se pudieron cargar los datos del cuadro de mando.');
          this.loading.set(false);
        },
      });
  }

  private listen(): void {
    this.live = this.feed
      .watch(8)
      .pipe(
        skip(1),
        tap((activity) => this.activity.set(activity)),
        switchMap(() => this.api.getIncidentViews()),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((incidents) => this.incidents.set(incidents));
  }

  toggleStatus(status: IncidentStatus): void {
    this.status.update((current) => (current === status ? 'all' : status));
  }

  onStatusSegment(label: string): void {
    const status = STATUSES.find((s) => STATUS_LABELS[s] === label);
    if (status) this.toggleStatus(status);
  }

  onPrioritySegment(label: string): void {
    const priority = PRIORITIES.find((p) => PRIORITY_LABELS[p] === label);
    if (priority) this.priority.update((current) => (current === priority ? 'all' : priority));
  }

  clearFilters(): void {
    this.search.set('');
    this.status.set('all');
    this.priority.set('all');
    this.from.set('');
    this.to.set('');
  }

  open(incident: IncidentView): void {
    void this.router.navigate(['/incidencias', incident.id]);
  }

  percent(value: number): string {
    const total = this.withoutStatus().length;
    return total ? `${Math.round((value / total) * 100)} % del total` : '';
  }
}
