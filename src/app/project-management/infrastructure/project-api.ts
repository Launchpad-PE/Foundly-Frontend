import { Injectable, inject } from '@angular/core';
import { BaseApi } from '../../shared/infrastructure/base-api';
import { ProjectApiEndpoint } from './project-api-endpoint';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Project } from '../domain/entities/project.entity';
import { ProjectAssembler } from './project-assembler';
import { ProjectStatus } from '../domain/enum/project-status.enum';

@Injectable({ providedIn: 'root' })
export class ProjectApi extends BaseApi {
  private readonly projectEndpoint: ProjectApiEndpoint;
  private readonly assembler = new ProjectAssembler();

  constructor(httpClient: HttpClient) {
    super();
    this.projectEndpoint = new ProjectApiEndpoint(httpClient);
  }

  // ─── Project CRUD ─────────────────────────────────────────────

  getProject(id: string): Observable<Project> {
    return this.projectEndpoint.getProjectById(id).pipe(
      map(response => this.assembler.toEntityFromResponse(response))
    );
  }

  /**
   * Get current user's projects (uses /me endpoint)
   */
  getMyProjects(): Observable<Project[]> {
    return this.projectEndpoint.getMyProjects().pipe(
      map(response => this.assembler.toEntitiesFromResponse(response))
    );
  }

  /**
   * Get projects by author ID (legacy, prefer getMyProjects)
   */
  getProjectsByAuthor(authorId: string): Observable<Project[]> {
    // Usar el endpoint /me que obtiene el usuario del token
    // El authorId se ignora porque el backend usa el token
    return this.getMyProjects();
  }

  getProjectsByStatus(status: ProjectStatus): Observable<Project[]> {
    return this.projectEndpoint.getByStatus(status).pipe(
      map(response => this.assembler.toEntitiesFromResponse(response))
    );
  }

  getProjectsByArea(area: string): Observable<Project[]> {
    return this.projectEndpoint.getByArea(area).pipe(
      map(response => this.assembler.toEntitiesFromResponse(response))
    );
  }

  getAllProjects(): Observable<Project[]> {
    return this.projectEndpoint.getAll().pipe(
      map(projects => projects)
    );
  }

  createProject(project: Project): Observable<Project> {
    return this.projectEndpoint.createProject(project).pipe(
      map(response => this.assembler.toEntityFromResponse(response))
    );
  }

  updateProject(project: Project): Observable<Project> {
    return this.projectEndpoint.updateProject(project.id.toString(), project).pipe(
      map(response => this.assembler.toEntityFromResponse(response))
    );
  }

  patchProject(id: string, updateData: {
    name?: string;
    summary?: string;
    status?: ProjectStatus;
    tags?: string[];
    benefits?: string[];
    requiredSkills?: string[];
  }): Observable<Project> {
    const resourcePartial: any = {};

    if (updateData.name) resourcePartial.name = updateData.name;
    if (updateData.summary) resourcePartial.summary = updateData.summary;
    if (updateData.status) resourcePartial.status = updateData.status;
    if (updateData.tags) resourcePartial.tags = updateData.tags;
    if (updateData.benefits) resourcePartial.benefits = updateData.benefits;
    if (updateData.requiredSkills) resourcePartial.requiredSkills = updateData.requiredSkills;

    return this.projectEndpoint.patchProject(id, resourcePartial).pipe(
      map(response => this.assembler.toEntityFromResponse(response))
    );
  }

  deleteProject(id: string): Observable<void> {
    return this.projectEndpoint.deleteProject(id);
  }

  publishProject(id: string): Observable<Project> {
    return this.projectEndpoint.publishProject(id).pipe(
      map(response => this.assembler.toEntityFromResponse(response))
    );
  }

  // ─── Roles ───────────────────────────────────────────────────

  addRole(projectId: string, role: { name: string; cardInfo: { title: string; items: string[] } }): Observable<Project> {
    const roleWithId = { ...role, id: crypto.randomUUID() };
    return this.projectEndpoint.addRole(projectId, roleWithId).pipe(
      map(response => this.assembler.toEntityFromResponse(response))
    );
  }

  removeRole(projectId: string, roleId: string): Observable<Project> {
    return this.projectEndpoint.removeRole(projectId, roleId).pipe(
      map(response => this.assembler.toEntityFromResponse(response))
    );
  }

  searchProjects(searchTerm: string): Observable<Project[]> {
    return this.projectEndpoint.searchProjects(searchTerm).pipe(
      map(response => this.assembler.toEntitiesFromResponse(response))
    );
  }
}
