import { IncidentPriority, IncidentStatus, IncidentView } from './incident.model';

export interface IncidentFilter {
  search: string;
  status: IncidentStatus | 'all';
  priority: IncidentPriority | 'all';
  /** Fecha mínima (yyyy-mm-dd), inclusiva. */
  from: string;
  /** Fecha máxima (yyyy-mm-dd), inclusiva. */
  to: string;
}

export const EMPTY_FILTER: IncidentFilter = {
  search: '',
  status: 'all',
  priority: 'all',
  from: '',
  to: '',
};

/** Aplica un filtro sin modificar la lista original. */
export function applyIncidentFilter(
  incidents: IncidentView[],
  filter: IncidentFilter,
): IncidentView[] {
  const search = filter.search.trim().toLowerCase();
  return incidents.filter((incident) => {
    const day = incident.createdAt.slice(0, 10);
    return (
      (!search ||
        incident.title.toLowerCase().includes(search) ||
        incident.id.toLowerCase().includes(search) ||
        incident.departmentName.toLowerCase().includes(search)) &&
      (filter.status === 'all' || incident.status === filter.status) &&
      (filter.priority === 'all' || incident.priority === filter.priority) &&
      (!filter.from || day >= filter.from) &&
      (!filter.to || day <= filter.to)
    );
  });
}
