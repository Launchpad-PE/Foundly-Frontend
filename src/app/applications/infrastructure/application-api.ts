import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import { BaseApi } from '../../shared/infrastructure/base-api';
import { Application } from '../domain/entities/application.entity';
import { ApplicationApiEndpoint } from './application-api-endpoint';
import { ApplicationAssembler } from './application-assembler';
import { ApplicationStatus } from '../domain/enum/application-status.enum';

@Injectable({ providedIn: 'root' })
export class ApplicationApi extends BaseApi {
  private readonly applicationEndpoint: ApplicationApiEndpoint;
  private readonly assembler = new ApplicationAssembler();

  constructor(httpClient: HttpClient) {
    super();
    this.applicationEndpoint = new ApplicationApiEndpoint(httpClient);
  }

  // ─── Application CRUD ────────────────────────────────────────

  getApplication(id: string): Observable<Application> {
    return this.applicationEndpoint.getApplicationById(id).pipe(
      map(response => this.assembler.toEntityFromResponse(response))
    );
  }

  getApplicationsByProject(projectId: string): Observable<Application[]> {
    return this.applicationEndpoint.getByProjectId(projectId).pipe(
      map(response => this.assembler.toEntitiesFromResponse(response))
    );
  }

  getApplicationsByUser(userId: string): Observable<Application[]> {
    return this.applicationEndpoint.getByUserId(userId).pipe(
      map(response => this.assembler.toEntitiesFromResponse(response))
    );
  }

  getApplicationsByProjectAndUser(projectId: string, userId: string): Observable<Application[]> {
    return this.applicationEndpoint.getByProjectAndUser(projectId, userId).pipe(
      map(response => this.assembler.toEntitiesFromResponse(response))
    );
  }

  createApplication(application: Application): Observable<Application> {
    return this.applicationEndpoint.createApplication(application).pipe(
      map(response => this.assembler.toEntityFromResponse(response))
    );
  }

  updateStatus(id: string, status: ApplicationStatus): Observable<Application> {
    return this.applicationEndpoint.updateStatus(id, status).pipe(
      map(response => this.assembler.toEntityFromResponse(response))
    );
  }

  deleteApplication(id: string): Observable<void> {
    return this.applicationEndpoint.deleteApplication(id);
  }

  /**
   * Check if a user has already applied to a project
   * @param projectId - The project ID (numeric string)
   * @param userId - The user ID (numeric string)
   * @returns Observable<boolean> - true if already applied
   */
  checkIfApplied(projectId: string, userId: string): Observable<boolean> {
    return this.applicationEndpoint.checkIfApplied(projectId, userId);
  }
}
