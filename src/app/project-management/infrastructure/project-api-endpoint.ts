import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-endpoint';
import { environment } from '../../../environments/environment';
import { Project } from '../domain/entities/project.entity';
import { ProjectResource, ProjectResponse, ProjectsResponse } from './project-response';
import { ProjectAssembler } from './project-assembler';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { ProjectStatus } from '../domain/enum/project-status.enum';
import { HttpClient } from '@angular/common/http';

export class ProjectApiEndpoint extends BaseApiEndpoint<Project, ProjectResource, ProjectResponse | ProjectsResponse, ProjectAssembler> {

  private readonly projectsUrl: string;

  constructor(http: HttpClient) {
    super(http, `${environment.platformProviderApiBaseUrl}${environment.platformProjectEndpointPath}`, new ProjectAssembler());
    this.projectsUrl = `${environment.platformProviderApiBaseUrl}${environment.platformProjectEndpointPath}`;
  }

  /**
   * Get project by ID
   */
  getProjectById(id: string): Observable<ProjectResponse> {
    return this.http.get<ProjectResource>(`${this.projectsUrl}/${id}`).pipe(
      map(project => ({ project }) as ProjectResponse)
    );
  }

  /**
   * Get projects by author ID
   */
  getByAuthorId(authorId: string): Observable<ProjectsResponse> {
    return this.http.get<ProjectResource[]>(`${this.projectsUrl}?authorId=${authorId}`).pipe(
      map(projects => ({ projects }) as ProjectsResponse)
    );
  }

  /**
   * Get projects by status
   */
  getByStatus(status: ProjectStatus): Observable<ProjectsResponse> {
    return this.http.get<ProjectResource[]>(`${this.projectsUrl}?status=${status}`).pipe(
      map(projects => ({ projects }) as ProjectsResponse)
    );
  }

  /**
   * Get projects by area
   */
  getByArea(area: string): Observable<ProjectsResponse> {
    return this.http.get<ProjectResource[]>(`${this.projectsUrl}?area=${area}`).pipe(
      map(projects => ({ projects }) as ProjectsResponse)
    );
  }

  /**
   * Create project
   */
  createProject(project: Project): Observable<ProjectResponse> {
    const resource = this.assembler.toResourceFromEntity(project);
    return this.http.post<ProjectResource>(this.projectsUrl, resource).pipe(
      map(created => ({ project: created }) as ProjectResponse)
    );
  }

  /**
   * Update project
   */
  updateProject(id: string, project: Project): Observable<ProjectResponse> {
    const resource = this.assembler.toResourceFromEntity(project);
    return this.http.put<ProjectResource>(`${this.projectsUrl}/${id}`, resource).pipe(
      map(updated => ({ project: updated }) as ProjectResponse)
    );
  }

  /**
   * Patch project (partial update)
   */
  patchProject(id: string, partialData: Partial<ProjectResource>): Observable<ProjectResponse> {
    return this.http.patch<ProjectResource>(`${this.projectsUrl}/${id}`, partialData).pipe(
      map(updated => ({ project: updated }) as ProjectResponse)
    );
  }

  /**
   * Delete project
   */
  deleteProject(id: string): Observable<void> {
    return this.http.delete<void>(`${this.projectsUrl}/${id}`);
  }

  /**
   * Add role to project
   */
  addRole(projectId: string, role: any): Observable<ProjectResponse> {
    return this.http.get<ProjectResource>(`${this.projectsUrl}/${projectId}`).pipe(
      switchMap(project => {
        const roles = [...(project.roles || []), role];
        return this.http.patch<ProjectResource>(`${this.projectsUrl}/${projectId}`, { roles });
      }),
      map(response => ({ project: response }) as ProjectResponse)
    );
  }

  /**
   * Remove role from project
   */
  removeRole(projectId: string, roleId: string): Observable<ProjectResponse> {
    return this.http.get<ProjectResource>(`${this.projectsUrl}/${projectId}`).pipe(
      switchMap(project => {
        const roles = (project.roles || []).filter(r => r.id !== roleId);
        return this.http.patch<ProjectResource>(`${this.projectsUrl}/${projectId}`, { roles });
      }),
      map(response => ({ project: response }) as ProjectResponse)
    );
  }

  /**
   * Publish project (change status from DRAFT to PUBLISHED)
   */
  publishProject(projectId: string): Observable<ProjectResponse> {
    return this.patchProject(projectId, { status: ProjectStatus.PUBLISHED });
  }

  // infrastructure/project-api-endpoint.ts
  searchProjects(searchTerm: string): Observable<ProjectsResponse> {
    return this.http.get<ProjectResource[]>(`${this.projectsUrl}?q=${searchTerm}`).pipe(
      map(projects => ({ projects }) as ProjectsResponse)
    );
  }
}
