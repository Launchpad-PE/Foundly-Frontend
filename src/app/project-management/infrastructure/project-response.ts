// infrastructure/project-response.ts
import { BaseResource, BaseResponse } from '../../shared/infrastructure/base-response';
import { ProjectStatus } from '../domain/enum/project-status.enum';
import { EnvironmentalMetric} from '../domain/value-objects/environmental-impact.vo';
import {DurationType} from '../domain/value-objects/duration.vo';

export interface RoleResource extends BaseResource {
  id: string;
  name: string;
  cardInfo: {
    title: string;
    items: string[];
  };
}

export interface ProjectResource extends BaseResource {
  id: string;
  name: string;
  area: string;
  tags: string[];
  summary: string;
  environmentalImpact: EnvironmentalMetric[] | null;
  academicLevel: string | null;
  benefits: string[];
  requiredSkills: string[];
  duration: {
    amount: number;
    type: DurationType;
  };
  roles: RoleResource[];
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
  authorId: string;
}

export interface ProjectResponse extends BaseResponse {
  project: ProjectResource;
}

export interface ProjectsResponse extends BaseResponse {
  projects: ProjectResource[];
}
