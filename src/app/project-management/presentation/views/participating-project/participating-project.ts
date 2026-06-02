import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import {ProjectStore} from '../../../application/project-store';
import {Project} from '../../../domain/entities/project.entity';
import { UserStore } from '../../../../iam/application/user.store';
import {MyTasksCardComponent} from '../../../../task-management/presentation/components/my-tasks-card/my-tasks-card';
import {MyTasksListComponent} from '../../../../task-management/presentation/components/my-tasks-list/my-tasks-list';
import {
  MyMilestoneTasksComponent
} from '../../../../milestones-management/presentation/my-milestone-tasks/my-milestone-tasks.component';

type ParticipatingTab = 'inicio' | 'tareas' | 'hitos';

/**
 * Vista del COLABORADOR sobre un proyecto en el que participa
 * (su Application está en status='accepted'). Distinta a project-detail
 * que es del emprendedor.
 */
@Component({
  selector: 'app-participating-project',
  standalone: true,
  imports: [CommonModule, MyTasksCardComponent, MyTasksListComponent, MyMilestoneTasksComponent],
  templateUrl: './participating-project.html',
  styleUrls: ['./participating-project.css']
})
export class ParticipatingProjectComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private projectStore = inject(ProjectStore);
  private userStore = inject(UserStore);

  project = signal<Project | null>(null);
  activeTab = signal<ParticipatingTab>('inicio');
  loading = signal<boolean>(true);

  get projectName(): string {
    return this.project()?.name.getValue() ?? '';
  }

  get projectId(): string {
    return this.project()?.id ?? '';
  }

  get currentUserId(): string {
    return this.userStore.currentUser()?.id ?? '';
  }

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/projects']);
      return;
    }
    const p = await this.projectStore.loadProject(id);
    this.project.set(p);
    this.loading.set(false);
  }

  setTab(tab: ParticipatingTab): void {
    this.activeTab.set(tab);
  }

  goBack(): void {
    this.router.navigate(['/projects']);
  }

  // Método para refrescar tareas cuando se actualiza una
  async refreshTasks(): Promise<void> {
    // Recargar el proyecto para actualizar los hitos
    const p = await this.projectStore.loadProject(this.projectId);
    this.project.set(p);
  }
}
