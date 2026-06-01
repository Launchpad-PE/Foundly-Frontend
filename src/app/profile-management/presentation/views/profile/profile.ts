import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProfileStore } from '../../../application/profile.store';
import { UserStore } from '../../../../iam/application/user.store';
import { ProjectStore } from '../../../../project-management/application/project-store';
import { Project } from '../../../../project-management/domain/entities/project.entity';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class ProfileComponent implements OnInit {
  private profileStore = inject(ProfileStore);
  private userStore = inject(UserStore);
  private projectStore = inject(ProjectStore);
  private router = inject(Router);

  profile = this.profileStore.currentProfile;
  loading = this.profileStore.loading;

  myProjects = this.projectStore.userProjects;
  projectCount = 0;

  activeSection: 'projects' | 'comments' = 'projects';
  activeProjectTab: 'mine' | 'favorites' = 'mine';
  showExperiences = false;

  async ngOnInit(): Promise<void> {
    const userId = this.userStore.currentUser()?.id;
    if (!userId) {
      this.router.navigate(['/login']);
      return;
    }

    // Load profile
    if (!this.profile()) {
      await this.profileStore.loadProfile(userId.toString());
    }

    // Load projects
    await this.projectStore.loadUserProjects(userId.toString());
    this.projectCount = this.myProjects().length;
  }

  toggleExperiences(): void {
    this.showExperiences = !this.showExperiences;
  }

  logout(): void {
    this.userStore.logout();
    this.router.navigate(['/login']);
  }

  viewProject(projectId: any): void {
    this.router.navigate(['/projects', projectId.toString()]);
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
