import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ProfileApi } from '../../../infrastructure/profile-api';
import { Profile } from '../../../domain/entities/profile.entity';
import { ProjectApi } from '../../../../project-management/infrastructure/project-api';
import { Project } from '../../../../project-management/domain/entities/project.entity';

@Component({
  selector: 'app-public-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './public-profile.html',
  styleUrl: './public-profile.css',
})
export class PublicProfileComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private profileApi = inject(ProfileApi);
  private projectApi = inject(ProjectApi);

  profile = signal<Profile | null>(null);
  userProjects = signal<Project[]>([]);
  loading = signal(true);
  projectsLoading = signal(false);

  showExperiences = false;
  activeTab: 'projects' | 'comments' = 'projects';

  async ngOnInit(): Promise<void> {
    const profileId = this.route.snapshot.params['id'];
    if (!profileId) {
      this.loading.set(false);
      return;
    }

    try {
      const p = await firstValueFrom(this.profileApi.getProfile(profileId));
      this.profile.set(p);

      // Cargar los proyectos del usuario usando su userId
      if (p && p.userId) {
        await this.loadUserProjects(p.userId);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      this.profile.set(null);
    } finally {
      this.loading.set(false);
    }
  }

  async loadUserProjects(userId: string): Promise<void> {
    this.projectsLoading.set(true);
    try {
      // Usar el nuevo método que obtiene proyectos por authorId
      const projects = await firstValueFrom(this.projectApi.getProjectsByAuthorId(userId));
      this.userProjects.set(projects);
      console.log(`📊 Proyectos cargados para usuario ${userId}:`, projects.length);
    } catch (err) {
      console.error('Error cargando proyectos del usuario:', err);
      this.userProjects.set([]);
    } finally {
      this.projectsLoading.set(false);
    }
  }

  toggleExperiences(): void {
    this.showExperiences = !this.showExperiences;
  }

  goBack(): void {
    this.router.navigate(['/home']);
  }

  viewProjectDetails(projectId: string): void {
    this.router.navigate(['/projects/info', projectId]);
  }

  formatDate(date: Date | string | undefined): string {
    if (!date) return '';
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear().toString().slice(2);
    return `${day}/${month}/${year}`;
  }
}
