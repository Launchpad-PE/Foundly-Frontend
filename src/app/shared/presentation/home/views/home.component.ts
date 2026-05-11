// shared/presentation/home/views/home.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ProjectCardComponent, Project as CardProject } from '../components/project-card/projectc-card';
import { CollaboratorCardComponent } from '../components/collaborator-card/collaborator-card';
import { UserStore } from '../../../../iam/application/user.store';
import { ProjectStore } from '../../../../project-management/application/project-store';
import { Project } from '../../../../project-management/domain/entities/project.entity';
import { ProjectStatus } from '../../../../project-management/domain/enum/project-status.enum';

interface Collaborator {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  isHighlighted?: boolean;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, ProjectCardComponent, CollaboratorCardComponent, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  private userStore = inject(UserStore);
  private projectStore = inject(ProjectStore);
  private router = inject(Router);

  currentPlan: string = 'Gratuito';
  searchTerm: string = '';
  filterRole: string = '';
  filterArea: string = '';

  highlightedCollaborators: Collaborator[] = [
    { id: '1', name: 'Christian Gonzalez', role: 'Arquitecto de Software', isHighlighted: true },
    { id: '2', name: 'Diana Briceño', role: 'Desarrollador Full Stack', isHighlighted: true },
    { id: '3', name: 'Mario Baca', role: 'Desarrollador de Videojuegos', isHighlighted: true }
  ];

  get homeProjects(): CardProject[] {
    const currentUserId = this.userStore.currentUser()?.id;

    const ownProjects = this.projectStore.userProjects()
      .map(p => this.mapToCardProject(p, currentUserId));

    const ownIds = new Set(ownProjects.map(p => p.id));

    const othersProjects = this.projectStore.allProjects()
      .filter(p => !ownIds.has(p.id))
      .map(p => this.mapToCardProject(p, currentUserId));

    return [...ownProjects, ...othersProjects];
  }

  get featuredProjects(): CardProject[] {
    const currentUserId = this.userStore.currentUser()?.id;
    return this.projectStore.allProjects()
      .filter(p => p.authorId.toString() !== currentUserId)
      .map(p => this.mapToCardProject(p, currentUserId));
  }

  private mapToCardProject(project: Project, currentUserId?: string): CardProject {
    return {
      id: project.id,
      title: project.name.getValue(),
      roles: project.roles.map(r => r.name.getValue()),
      areas: [project.area.getValue()],
      duration: project.duration.toString(),
      modality: 'Remoto',
      author: project.authorId.toString(),
      isOwn: project.authorId.toString() === currentUserId,
    };
  }

  isParticipatingIn(projectId: string): boolean {
    return this.projectStore.participatedProjects().some(p => p.id === projectId);
  }

  async ngOnInit(): Promise<void> {
    if (this.userStore.needsOnboarding()) {
      this.router.navigate(['/onboarding']);
      return;
    }
    const currentUserId = this.userStore.currentUser()?.id;
    await Promise.all([
      this.projectStore.loadAllProjects(),
      currentUserId ? this.projectStore.loadUserProjects(currentUserId) : Promise.resolve(),
    ]);
  }

  logout(): void {
    this.userStore.logout();
    this.router.navigate(['/login']);
  }

  onSearch(): void {
    console.log('Searching:', { term: this.searchTerm, role: this.filterRole, area: this.filterArea });
  }

  applyToProject(projectId: string): void {
    console.log('Applying to project:', projectId);
  }

  viewProjectDetails(projectId: string): void {
    this.router.navigate(['/projects', projectId]);
  }
}
