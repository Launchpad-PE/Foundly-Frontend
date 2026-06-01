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

  highlightedCollaborators: Profile[] = [];
  featuredProjects: ProjectCardData[] = [];
  allProjects: ProjectCardData[] = [];

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
      this.allProjects = domainProjects.map((p: DomainProject) =>
        this.mapToProjectCardData(p, currentUserId, userNames)
      );
      this.featuredProjects = this.allProjects.slice(0, 3);
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
    const modality = 'Remoto'; // Ajusta según tengas este dato

    // Obtener el nombre del autor del mapa, o usar el ID como fallback
    const authorId = domainProject.authorId.toString();
    const author = userNames?.get(authorId) || `Usuario ${authorId}`;

    // Verificar si el proyecto pertenece al usuario actual
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

  onSearch(): void {
    this.router.navigate(['/projects'], {
      queryParams: {
        search: this.searchTerm,
        role: this.filterRole,
        area: this.filterArea
      }
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
