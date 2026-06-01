// project-management/application/project.store.ts
import { Injectable, signal, computed, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Project } from '../domain/entities/project.entity';
import { ProjectApi } from '../infrastructure/project-api';
import { ApplicationApi } from '../../applications/infrastructure/application-api';
import { ApplicationStatus } from '../../applications/domain/enum/application-status.enum';
import { ProjectStatus } from '../domain/enum/project-status.enum';
import { EnvironmentalMetric } from '../domain/value-objects/environmental-impact.vo';
import { DurationType } from '../domain/value-objects/duration.vo';
import {ProfileApi} from '../../profile-management/infrastructure/profile-api';

export interface CreateProjectData {
  name: string;
  area: string;
  tags: string[];
  summary: string;
  environmentalImpact?: EnvironmentalMetric[];
  academicLevel?: string | null;
  benefits: string[];
  requiredSkills: string[];
  duration: { amount: number; type: DurationType };
  roles: Array<{
    name: string;
    cardInfo: { title: string; items: string[] };
  }>;
}

export interface UpdateProjectData {
  name?: string;
  summary?: string;
  status?: ProjectStatus;
  tags?: string[];
  benefits?: string[];
  requiredSkills?: string[];
}

@Injectable({ providedIn: 'root' })
export class ProjectStore {
  // State signals
  readonly currentProject = signal<Project | null>(null);
  readonly userProjects = signal<Project[]>([]);
  readonly allProjects = signal<Project[]>([]);
  readonly loading = signal<boolean>(false);
  readonly error = signal<string | null>(null);
  readonly selectedStatus = signal<ProjectStatus | 'all'>('all');
  readonly selectedArea = signal<string | null>(null);
  readonly participatedProjects = signal<Project[]>([]);

  // Active tab para búsqueda (no es signal reactiva, solo para filtro)
  private currentActiveTab: 'my-projects' | 'participated' = 'my-projects';

  // Dependencies
  private projectApi = inject(ProjectApi);
  private profileApi = inject(ProfileApi);
  private applicationApi = inject(ApplicationApi);

  // Computed properties
  readonly filteredProjects = computed(() => {
    let projects = this.allProjects();

    // Filter by status
    if (this.selectedStatus() !== 'all') {
      projects = projects.filter(p => p.status === this.selectedStatus());
    }

    // Filter by area
    if (this.selectedArea()) {
      projects = projects.filter(p => p.area.getValue() === this.selectedArea());
    }

    return projects;
  });

  readonly hasProjects = computed(() => this.userProjects().length > 0);
  readonly projectsCount = computed(() => this.userProjects().length);
  readonly draftProjects = computed(() =>
    this.userProjects().filter(p => p.status === ProjectStatus.DRAFT)
  );
  readonly publishedProjects = computed(() =>
    this.userProjects().filter(p => p.status === ProjectStatus.PUBLISHED)
  );

  // ── Private helpers ─────────────────────────────────────────────

  private setLoading(value: boolean): void {
    this.loading.set(value);
  }

  private setError(msg: string | null): void {
    this.error.set(msg);
  }

  private clearError(): void {
    this.error.set(null);
  }

  // ── Public actions ──────────────────────────────────────────────

  /**
   * Set current active tab for search filtering
   */
  setActiveTab(tab: 'my-projects' | 'participated'): void {
    this.currentActiveTab = tab;
  }

  /**
   * Create a new project
   */
  async createProject(projectData: CreateProjectData, authorId: string): Promise<Project> {
    this.setLoading(true);
    this.clearError();

    try {
      const project = Project.create({
        ...projectData,
        authorId: authorId,
      });

      const savedProject = await firstValueFrom(this.projectApi.createProject(project));

      // Update stores
      this.currentProject.set(savedProject);
      this.userProjects.update(projects => [savedProject, ...projects]);

      console.log('✅ Project created successfully', savedProject);
      return savedProject;
    } catch (err: any) {
      const msg = err?.message || 'Error al crear el proyecto';
      this.setError(msg);
      throw err;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Load project by ID
   */
  async loadProject(projectId: string): Promise<Project | null> {
    this.setLoading(true);
    this.clearError();

    try {
      const project = await firstValueFrom(this.projectApi.getProject(projectId));
      this.currentProject.set(project);
      return project;
    } catch (err: any) {
      if (err.status === 404) {
        console.log('📋 No project found with id:', projectId);
        return null;
      }
      this.setError(err.message);
      return null;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Load all projects by current user
   */
  async loadUserProjects(userId: string): Promise<Project[]> {
    this.setLoading(true);
    this.clearError();

    try {
      const projects = await firstValueFrom(this.projectApi.getProjectsByAuthor(userId));
      this.userProjects.set(projects);
      return projects;
    } catch (err: any) {
      this.setError(err.message);
      return [];
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Load all published projects (for discovery)
   */
  async loadAllPublishedProjects(): Promise<Project[]> {
    this.setLoading(true);
    this.clearError();

    try {
      const projects = await firstValueFrom(this.projectApi.getProjectsByStatus(ProjectStatus.PUBLISHED));
      this.allProjects.set(projects);
      return projects;
    } catch (err: any) {
      this.setError(err.message);
      return [];
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Load all projects regardless of status (for home discovery)
   */
  async loadAllProjects(): Promise<Project[]> {
    this.setLoading(true);
    this.clearError();

    try {
      let projects = await firstValueFrom(this.projectApi.getAllProjects());

      // Enriquecer proyectos con nombre del autor
      projects = await this.enrichProjectsWithAuthorNames(projects);

      this.allProjects.set(projects);
      return projects;
    } catch (err: any) {
      this.setError(err.message);
      return [];
    } finally {
      this.setLoading(false);
    }
  }

  private async enrichProjectsWithAuthorNames(projects: Project[]): Promise<Project[]> {
    try {
      // Obtener todos los perfiles
      const profiles = await firstValueFrom(this.profileApi.getAllProfiles());

      // Crear un mapa de userId -> username
      const userNames = new Map<string, string>();
      profiles.forEach(profile => {
        userNames.set(profile.userId.toString(), profile.username);
      });

      // Enriquecer cada proyecto
      return projects.map(project => {
        const authorName = userNames.get(project.authorId.toString()) || 'Usuario';
        // Crear un nuevo proyecto con el authorName (necesitarías un método updateName)
        // O clonar el proyecto y asignar el nombre
        return this.addAuthorNameToProject(project, authorName);
      });
    } catch (err) {
      console.error('Error enriching projects:', err);
      return projects;
    }
  }

  private addAuthorNameToProject(project: Project, authorName: string): Project {
    // Método temporal para agregar el nombre - idealmente deberías
    // tener un método en Project.updateAuthorName()
    return Project.create({
      id: project.id,
      name: project.name.getValue(),
      area: project.area.getValue(),
      tags: project.tags.map(t => t.getValue()),
      summary: project.summary.getValue(),
      environmentalImpact: project.environmentalImpact?.getMetrics(),
      academicLevel: project.academicLevel?.getValue(),
      benefits: project.benefits.map(b => b.getDescription()),
      requiredSkills: project.requiredSkills.map(s => s.getValue()),
      duration: {
        amount: project.duration.getAmount(),
        type: project.duration.getType()
      },
      roles: project.roles.map(r => ({
        name: r.name.getValue(),
        cardInfo: {
          title: r.cardInfo.title.getValue(),
          items: r.cardInfo.items.map(i => i.getDescription())
        }
      })),
      authorId: project.authorId.toString(),
      authorName: authorName,
      status: project.status,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString()
    });
  }

  /**
   * Load projects by area
   */
  async loadProjectsByArea(area: string): Promise<Project[]> {
    this.setLoading(true);
    this.clearError();

    try {
      const projects = await firstValueFrom(this.projectApi.getProjectsByArea(area));
      return projects;
    } catch (err: any) {
      this.setError(err.message);
      return [];
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Update project
   */
  async updateProject(projectId: string, updateData: UpdateProjectData): Promise<Project> {
    this.setLoading(true);
    this.clearError();

    try {
      const currentProject = this.currentProject();
      if (!currentProject || currentProject.id !== projectId) {
        await this.loadProject(projectId);
      }

      const updatedProject = await firstValueFrom(
        this.projectApi.patchProject(projectId, updateData)
      );

      // Update in stores
      this.currentProject.set(updatedProject);

      this.userProjects.update(projects =>
        projects.map(p => p.id === projectId ? updatedProject : p)
      );

      this.allProjects.update(projects =>
        projects.map(p => p.id === projectId ? updatedProject : p)
      );

      console.log('✅ Project updated successfully', updatedProject);
      return updatedProject;
    } catch (err: any) {
      const msg = err?.message || 'Error al actualizar el proyecto';
      this.setError(msg);
      throw err;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Publish project (change status from DRAFT to PUBLISHED)
   */
  async publishProject(projectId: string): Promise<Project> {
    this.setLoading(true);
    this.clearError();

    try {
      const publishedProject = await firstValueFrom(
        this.projectApi.publishProject(projectId)
      );

      // Update in stores
      this.currentProject.set(publishedProject);

      this.userProjects.update(projects =>
        projects.map(p => p.id === projectId ? publishedProject : p)
      );

      this.allProjects.update(projects =>
        projects.map(p => p.id === projectId ? publishedProject : p)
      );

      console.log('✅ Project published successfully', publishedProject);
      return publishedProject;
    } catch (err: any) {
      const msg = err?.message || 'Error al publicar el proyecto';
      this.setError(msg);
      throw err;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Delete project
   */
  async deleteProject(projectId: string): Promise<void> {
    this.setLoading(true);
    this.clearError();

    try {
      await firstValueFrom(this.projectApi.deleteProject(projectId));

      // Remove from stores
      if (this.currentProject()?.id === projectId) {
        this.currentProject.set(null);
      }

      this.userProjects.update(projects =>
        projects.filter(p => p.id !== projectId)
      );

      this.allProjects.update(projects =>
        projects.filter(p => p.id !== projectId)
      );

      console.log('✅ Project deleted successfully');
    } catch (err: any) {
      const msg = err?.message || 'Error al eliminar el proyecto';
      this.setError(msg);
      throw err;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Add role to project
   */
  async addRoleToProject(projectId: string, role: {
    name: string;
    cardInfo: { title: string; items: string[] };
  }): Promise<Project> {
    this.setLoading(true);
    this.clearError();

    try {
      const updatedProject = await firstValueFrom(
        this.projectApi.addRole(projectId, role)
      );

      // Update in stores
      this.currentProject.set(updatedProject);

      this.userProjects.update(projects =>
        projects.map(p => p.id === projectId ? updatedProject : p)
      );

      console.log('✅ Role added successfully');
      return updatedProject;
    } catch (err: any) {
      const msg = err?.message || 'Error al agregar el rol';
      this.setError(msg);
      throw err;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Remove role from project
   */
  async removeRoleFromProject(projectId: string, roleId: string): Promise<Project> {
    this.setLoading(true);
    this.clearError();

    try {
      const updatedProject = await firstValueFrom(
        this.projectApi.removeRole(projectId, roleId)
      );

      // Update in stores
      this.currentProject.set(updatedProject);

      this.userProjects.update(projects =>
        projects.map(p => p.id === projectId ? updatedProject : p)
      );

      console.log('✅ Role removed successfully');
      return updatedProject;
    } catch (err: any) {
      const msg = err?.message || 'Error al eliminar el rol';
      this.setError(msg);
      throw err;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Set filter by status
   */
  setStatusFilter(status: ProjectStatus | 'all'): void {
    this.selectedStatus.set(status);
  }

  /**
   * Set filter by area
   */
  setAreaFilter(area: string | null): void {
    this.selectedArea.set(area);
  }

  /**
   * Clear all filters
   */
  clearFilters(): void {
    this.selectedStatus.set('all');
    this.selectedArea.set(null);
  }

  /**
   * Load participated projects (where user has applied)
   */
  async loadParticipatedProjects(userId: string): Promise<Project[]> {
    this.setLoading(true);
    this.clearError();

    try {
      // 1. Traer las Applications del usuario y filtrar las aceptadas.
      const applications = await firstValueFrom(
        this.applicationApi.getApplicationsByUser(userId)
      );
      const acceptedProjectIds = Array.from(new Set(
        applications
          .filter(a => a.status === ApplicationStatus.ACCEPTED)
          .map(a => a.projectId.toString())
      ));

      // 2. Cargar los Projects correspondientes. Ignoramos los que fallen
      //    (ej. proyecto borrado) para no romper la pantalla entera.
      const results = await Promise.all(
        acceptedProjectIds.map(id =>
          firstValueFrom(this.projectApi.getProject(id)).catch(() => null)
        )
      );
      const projects = results.filter((p): p is Project => p !== null);

      this.participatedProjects.set(projects);
      return projects;
    } catch (err: any) {
      const msg = err?.message || 'Error al cargar proyectos participados';
      this.setError(msg);
      return [];
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Search projects by term (local filtering)
   */
  searchProjects(searchTerm: string): Project[] {
    const term = searchTerm.toLowerCase().trim();

    if (!term) {
      // Si no hay término, retornar todos según el tab activo
      return this.currentActiveTab === 'my-projects'
        ? this.userProjects()
        : this.participatedProjects();
    }

    // Filtrar según el tab activo
    const projectsToSearch = this.currentActiveTab === 'my-projects'
      ? this.userProjects()
      : this.participatedProjects();

    const filtered = projectsToSearch.filter(project => {
      return (
        project.name.getValue().toLowerCase().includes(term) ||
        project.summary.getValue().toLowerCase().includes(term) ||
        project.tags.some(tag => tag.getValue().toLowerCase().includes(term)) ||
        project.requiredSkills.some(skill => skill.getValue().toLowerCase().includes(term))
      );
    });

    // Actualizar el signal correspondiente con los resultados filtrados
    if (this.currentActiveTab === 'my-projects') {
      this.userProjects.set(filtered);
    } else {
      this.participatedProjects.set(filtered);
    }

    return filtered;
  }

  /**
   * Restore original projects after search (reload from API)
   */
  async restoreProjects(userId: string): Promise<void> {
    await this.loadUserProjects(userId);
    await this.loadParticipatedProjects(userId);
  }

  /**
   * Reset project store
   */
  reset(): void {
    this.currentProject.set(null);
    this.userProjects.set([]);
    this.allProjects.set([]);
    this.participatedProjects.set([]);
    this.loading.set(false);
    this.error.set(null);
    this.selectedStatus.set('all');
    this.selectedArea.set(null);
    this.currentActiveTab = 'my-projects';
  }
}
