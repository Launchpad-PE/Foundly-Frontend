import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-endpoint';
import { environment } from '../../../environments/environment';
import { Application } from '../domain/entities/application.entity';
import { ApplicationAssembler } from './application-assembler';
import {
  ApplicationResource,
  ApplicationResponse,
  ApplicationsResponse
} from './application-response';
import { ApplicationStatus } from '../domain/enum/application-status.enum';

export class ApplicationApiEndpoint extends BaseApiEndpoint<
  Application,
  ApplicationResource,
  ApplicationResponse | ApplicationsResponse,
  ApplicationAssembler
> {
  private readonly applicationsUrl: string;

  constructor(http: HttpClient) {
    super(
      http,
      `${environment.platformProviderApiBaseUrl}${environment.platformApplicationEndpointPath}`,
      new ApplicationAssembler()
    );
    this.applicationsUrl = `${environment.platformProviderApiBaseUrl}${environment.platformApplicationEndpointPath}`;
  }

  /**
   * Get application by ID
   */
  getApplicationById(id: string): Observable<ApplicationResponse> {
    return this.http.get<ApplicationResource>(`${this.applicationsUrl}/${id}`).pipe(
      map(application => ({ application }) as ApplicationResponse)
    );
  }

  /**
   * Get applications by project ID
   */
  getByProjectId(projectId: string): Observable<ApplicationsResponse> {
    return this.http.get<ApplicationResource[]>(`${this.applicationsUrl}?projectId=${projectId}`).pipe(
      map(applications => ({ applications }) as ApplicationsResponse)
    );
  }

  /**
   * Get applications by user ID (postulaciones que ha enviado el colaborador)
   */
  getByUserId(userId: string): Observable<ApplicationsResponse> {
    return this.http.get<ApplicationResource[]>(`${this.applicationsUrl}?userId=${userId}`).pipe(
      map(applications => ({ applications }) as ApplicationsResponse)
    );
  }

  /**
   * Get applications by project and user (para validar duplicados)
   */
  getByProjectAndUser(projectId: string, userId: string): Observable<ApplicationsResponse> {
    const url = `${this.applicationsUrl}?projectId=${projectId}&userId=${userId}`;
    return this.http.get<ApplicationResource[]>(url).pipe(
      map(applications => ({ applications }) as ApplicationsResponse)
    );
  }

  /**
   * Create application
   */
  createApplication(application: Application): Observable<ApplicationResponse> {
    const resource = this.assembler.toResourceFromEntity(application);
    return this.http.post<ApplicationResource>(this.applicationsUrl, resource).pipe(
      map(created => ({ application: created }) as ApplicationResponse)
    );
  }

  /**
   * Patch application (partial update — usado para cambiar status)
   */
  patchApplication(id: string, partialData: Partial<ApplicationResource>): Observable<ApplicationResponse> {
    return this.http.patch<ApplicationResource>(`${this.applicationsUrl}/${id}`, partialData).pipe(
      map(updated => ({ application: updated }) as ApplicationResponse)
    );
  }

  /**
   * Delete application
   */
  deleteApplication(id: string): Observable<void> {
    return this.http.delete<void>(`${this.applicationsUrl}/${id}`);
  }

  /**
   * Update application status (accept / reject)
   */
  updateStatus(id: string, status: ApplicationStatus): Observable<ApplicationResponse> {
    return this.http.post<ApplicationResource>(
      `${this.applicationsUrl}/${id}/status`,
      { status }
    ).pipe(
      map(updated => ({ application: updated }) as ApplicationResponse)
    );
  }

  /**
   * Check if a user has already applied to a project
   * @param projectId - The project ID (numeric string)
   * @param userId - The user ID (numeric string)
   * @returns Observable<boolean> - true if already applied
   */
  checkIfApplied(projectId: string, userId: string): Observable<boolean> {
    return this.http.get<boolean>(
      `${this.applicationsUrl}/check?projectId=${projectId}&userId=${userId}`
    );
  }
}
