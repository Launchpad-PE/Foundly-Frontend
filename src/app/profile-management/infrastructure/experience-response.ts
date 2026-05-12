import { BaseResource } from '../../shared/infrastructure/base-response';

export interface ExperienceResource extends BaseResource {
  id: string;
  title: string;
  company: string;
  period: string;
  description: string | null;
  current: boolean;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
}
