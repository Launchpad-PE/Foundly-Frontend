// home.component.ts
import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ProjectCardComponent, Project as ProjectCardData } from '../components/project-card/projectc-card';
import { CollaboratorCardComponent } from '../components/collaborator-card/collaborator-card';
import { UserStore } from '../../../../iam/application/user.store';
import { ProfileApi } from '../../../../profile-management/infrastructure/profile-api';
import { Profile } from '../../../../profile-management/domain/entities/profile.entity';
import { ProjectStore } from '../../../../project-management/application/project-store';
import { Project as DomainProject } from '../../../../project-management/domain/entities/project.entity';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ProjectCardComponent,
    CollaboratorCardComponent,
    RouterLink,
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  private userStore = inject(UserStore);
  private router = inject(Router);
  private profileApi = inject(ProfileApi);
  private projectStore = inject(ProjectStore);
  private cdr = inject(ChangeDetectorRef);

  currentPlan: string = 'Gratuito';
  searchTerm: string = '';
  filterRole: string = '';
  filterArea: string = '';

  // Propiedades para búsqueda y filtrado
  hasSearched: boolean = false;
  displayedProjects: ProjectCardData[] = [];
  allProjectsOriginal: ProjectCardData[] = []; // Guardar copia original

  highlightedCollaborators: Profile[] = [];
  featuredProjects: ProjectCardData[] = [];

  // Propiedad computada para el label de resultados
  get resultLabel(): string {
    if (this.hasSearched) {
      return `${this.displayedProjects.length} ${this.displayedProjects.length === 1 ? 'resultado' : 'resultados'}`;
    }
    return `${this.displayedProjects.length} ${this.displayedProjects.length === 1 ? 'proyecto' : 'proyectos'}`;
  }

  async ngOnInit(): Promise<void> {
    if (this.userStore.needsOnboarding()) {
      this.router.navigate(['/onboarding']);
      return;
    }

    await this.loadHomeData();
  }

  async loadHomeData(): Promise<void> {
    try {
      const profiles = await firstValueFrom(this.profileApi.getAllProfiles());
      const domainProjects = await this.projectStore.loadAllProjects();
      const currentUserId = this.userStore.currentUser()?.id;

      // Crear un mapa de userId -> username
      const userNames = new Map<string, string>();
      profiles.forEach(profile => {
        userNames.set(profile.userId.toString(), profile.username);
      });

      this.highlightedCollaborators = profiles;
      this.allProjectsOriginal = domainProjects.map((p: DomainProject) =>
        this.mapToProjectCardData(p, currentUserId, userNames)
      );

      // Inicializar displayedProjects con todos los proyectos
      this.displayedProjects = [...this.allProjectsOriginal];
      this.featuredProjects = this.allProjectsOriginal.slice(0, 3);
      this.hasSearched = false;

      this.cdr.detectChanges();
    } catch (err: any) {
      console.error('Error cargando datos:', err);
    }
  }

  private mapToProjectCardData(
    domainProject: DomainProject,
    currentUserId?: string,
    userNames?: Map<string, string>
  ): ProjectCardData {
    const roleNames = domainProject.roles.map(role => role.name.getValue());
    const areas = [domainProject.area.getValue()];
    const duration = `${domainProject.duration.getAmount()} ${domainProject.duration.getType()}`;
    const modality = 'Remoto';

    const authorId = domainProject.authorId.toString();
    const author = userNames?.get(authorId) || `Usuario ${authorId}`;
    const isOwn = currentUserId ? authorId === currentUserId : false;

    return {
      id: domainProject.id.toString(),
      title: domainProject.name.getValue(),
      roles: roleNames,
      areas: areas,
      author: author,
      duration: duration,
      modality: modality,
      isOwn: isOwn
    };
  }

  /**
   * Realizar búsqueda/filtrado de proyectos
   */
  onSearch(): void {
    this.hasSearched = true;

    let filtered = [...this.allProjectsOriginal];

    // Filtrar por término de búsqueda (título)
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(project =>
        project.title.toLowerCase().includes(term) ||
        project.roles.some(role => role.toLowerCase().includes(term))
      );
    }

    // Filtrar por rol
    if (this.filterRole) {
      const roleFilter = this.filterRole.toLowerCase();
      filtered = filtered.filter(project =>
        project.roles.some(role => role.toLowerCase().includes(roleFilter))
      );
    }

    // Filtrar por área
    if (this.filterArea) {
      const areaFilter = this.filterArea.toLowerCase();
      filtered = filtered.filter(project =>
        project.areas.some(area => area.toLowerCase().includes(areaFilter))
      );
    }

    this.displayedProjects = filtered;

    // Actualizar URL con parámetros de búsqueda (opcional)
    this.router.navigate([], {
      relativeTo: this.router.routerState.root,
      queryParams: {
        search: this.searchTerm || null,
        role: this.filterRole || null,
        area: this.filterArea || null
      },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

  /**
   * Limpiar todos los filtros de búsqueda
   */
  onClear(): void {
    this.searchTerm = '';
    this.filterRole = '';
    this.filterArea = '';
    this.hasSearched = false;
    this.displayedProjects = [...this.allProjectsOriginal];

    // Limpiar query params
    this.router.navigate([], {
      relativeTo: this.router.routerState.root,
      queryParams: {
        search: null,
        role: null,
        area: null
      },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

  applyToProject(projectId: string): void {
    this.router.navigate(['/projects', projectId, 'apply']);
  }

  viewProjectDetails(projectId: string): void {
    this.router.navigate(['/projects/info', projectId]);
  }

  viewProfile(collaboratorId: string): void {
    this.router.navigate(['/profile', collaboratorId]);
  }

  isParticipatingIn(projectId: string): boolean {
    return false;
  }
}
