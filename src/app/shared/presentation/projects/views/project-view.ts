// project-view.ts
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UserStore } from '../../../../iam/application/user.store';
import { Project } from '../../../../project-management/domain/entities/project.entity';
import { MyProjects } from '../components/my-projects/my-projects';
import { ProjectStore } from '../../../../project-management/application/project-store';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [MyProjects, CommonModule, RouterModule, FormsModule],
  templateUrl: './project-view.html',
  styleUrls: ['./project-view.css']
})
export class ProjectsComponent implements OnInit, OnDestroy {
  private projectStore = inject(ProjectStore);
  private userStore = inject(UserStore);
  private router = inject(Router);

  activeTab: 'my-projects' | 'participated' = 'my-projects';
  searchTerm: string = '';

  myProjects = this.projectStore.userProjects;
  participatedProjects = this.projectStore.participatedProjects;
  loading = this.projectStore.loading;

  ngOnInit(): void {
    this.loadProjects();
  }

  ngOnDestroy(): void {}

  async loadProjects(): Promise<void> {
    const userId = this.userStore.currentUser()?.id;
    if (!userId) {
      console.error('No user logged in');
      return;
    }

    await this.projectStore.loadUserProjects(userId);
    await this.projectStore.loadParticipatedProjects(userId);
  }

  setActiveTab(tab: 'my-projects' | 'participated'): void {
    this.activeTab = tab;
    this.projectStore.setActiveTab(tab);

    if (this.searchTerm) {
      this.searchTerm = '';
      this.restoreProjects();
    }
  }

  getCurrentProjects(): Project[] {
    return this.activeTab === 'my-projects'
      ? this.myProjects()
      : this.participatedProjects();
  }

  onSearch(): void {
    if (this.searchTerm.trim()) {
      this.projectStore.searchProjects(this.searchTerm);
    } else {
      this.restoreProjects();
    }
  }

  async restoreProjects(): Promise<void> {
    const userId = this.userStore.currentUser()?.id;
    if (userId) {
      if (this.activeTab === 'my-projects') {
        await this.projectStore.loadUserProjects(userId);
      } else {
        await this.projectStore.loadParticipatedProjects(userId);
      }
    }
  }

  viewProjectDetails(projectId: string): void {
    if (this.activeTab === 'participated') {
      this.router.navigate(['/projects', projectId, 'participating']);
    } else {
      this.router.navigate(['/projects', projectId]);
    }
  }

  applyToProject(projectId: string): void {
    this.router.navigate(['/projects', projectId, 'apply']);
  }

  createNewProject(): void {
    this.router.navigate(['/projects/create']);
  }

  goToHome(): void {
    this.router.navigate(['/home']);
  }

  getProjectForCard(project: Project): any {
    return {
      id: project.id,
      title: project.name.getValue(),
      areas: [project.area.getValue()],
      roles: project.roles.map(role => role.name.getValue()),
      author: project.authorId.toString(),
      duration: project.duration.toString(),
      modality: project.duration.getType() === 'semanas' ? 'Remoto' : 'Presencial'
    }
  }
}
