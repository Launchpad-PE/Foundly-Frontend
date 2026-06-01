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

  currentPlan = 'Gratuito';
  searchTerm = '';
  filterRole = '';
  filterArea = '';
  hasSearched = false;

  highlightedCollaborators: Profile[] = [];
  featuredProjects: ProjectCardData[] = [];

  // Source list (never mutated after load)
  private _allProjects: ProjectCardData[] = [];
  // Displayed list (filtered)
  displayedProjects: ProjectCardData[] = [];

  get allProjects(): ProjectCardData[] { return this.displayedProjects; }

  async ngOnInit(): Promise<void> {
    if (this.userStore.needsOnboarding()) {
      this.router.navigate(['/onboarding']);
      return;
    }
    await this.loadHomeData();
  }

  async loadHomeData(): Promise<void> {
    try {
      const [profiles, domainProjects] = await Promise.all([
        firstValueFrom(this.profileApi.getAllProfiles()),
        this.projectStore.loadAllProjects(),
      ]);

      this.highlightedCollaborators = profiles;
      this._allProjects = domainProjects.map((p: DomainProject) => this.mapToProjectCardData(p));
      this.displayedProjects = [...this._allProjects];
      this.featuredProjects = this._allProjects.slice(0, 3);
      this.cdr.detectChanges();
    } catch (err: any) {
      console.error('Error cargando datos:', err);
    }
  }

  private mapToProjectCardData(p: DomainProject): ProjectCardData {
    return {
      id: p.id.toString(),
      title: p.name.getValue(),
      roles: p.roles.map(r => r.name.getValue()),
      areas: [p.area.getValue()],
      author: `Usuario ${p.authorId}`,
      duration: `${p.duration.getAmount()} ${p.duration.getType()}`,
      modality: 'Remoto',
    };
  }

  onSearch(): void {
    const term = this.searchTerm.trim().toLowerCase();
    const role = this.filterRole.toLowerCase();
    const area = this.filterArea.toLowerCase();

    this.displayedProjects = this._allProjects.filter(p => {
      const matchesTerm = !term ||
        p.title.toLowerCase().includes(term) ||
        p.roles.some(r => r.toLowerCase().includes(term)) ||
        p.areas.some(a => a.toLowerCase().includes(term));

      const matchesRole = !role ||
        p.roles.some(r => r.toLowerCase().includes(role));

      const matchesArea = !area ||
        p.areas.some(a => a.toLowerCase().includes(area));

      return matchesTerm && matchesRole && matchesArea;
    });

    this.hasSearched = !!(term || role || area);
    this.cdr.detectChanges();
  }

  onClear(): void {
    this.searchTerm = '';
    this.filterRole = '';
    this.filterArea = '';
    this.hasSearched = false;
    this.displayedProjects = [...this._allProjects];
    this.cdr.detectChanges();
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

  isParticipatingIn(_projectId: string): boolean {
    return false;
  }

  get resultLabel(): string {
    const n = this.displayedProjects.length;
    if (!this.hasSearched) return `${n} proyecto${n !== 1 ? 's' : ''}`;
    return `${n} resultado${n !== 1 ? 's' : ''}`;
  }
}
