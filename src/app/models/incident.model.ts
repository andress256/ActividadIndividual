export type IncidentStatus = 'open' | 'in-progress' | 'closed';
export type IncidentPriority = 'low' | 'medium' | 'high';

export interface Incident {
  id: string;
  title: string;
  description: string;
  status: IncidentStatus;
  priority: IncidentPriority;
  createdAt: string;
  createdBy: string;
}
