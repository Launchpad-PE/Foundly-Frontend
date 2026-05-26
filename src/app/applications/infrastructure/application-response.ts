// infrastructure/application-response.ts
import { BaseResource, BaseResponse } from '../../shared/infrastructure/base-response';
import { ApplicationStatus } from '../domain/enum/application-status.enum';

export interface ApplicationResource extends BaseResource {
  id: string;
  projectId: string;
  userId: string;
  roleId: string;
  fullName: string;
  email: string;
  portfolioUrl: string | null;
  phone: string | null;
  cvUrl: string;
  message: string;
  acceptedTerms: boolean;
  status: ApplicationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ApplicationResponse extends BaseResponse {
  application: ApplicationResource;
}

export interface ApplicationsResponse extends BaseResponse {
  applications: ApplicationResource[];
}
