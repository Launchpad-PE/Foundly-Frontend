import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { ProjectStore } from '../../../../project-management/application/project-store';
import { Project } from '../../../../project-management/domain/entities/project.entity';
import { UserStore } from '../../../../iam/application/user.store';
import { MyTasksCardComponent } from '../../components/my-tasks-card/my-tasks-card';
import { MyTasksListComponent } from '../../components/my-tasks-list/my-tasks-list';

type ParticipatingTab = 'inicio' | 'tareas' | 'hitos' | 'feedback';

/**
 * Vista del COLABORADOR sobre un proyecto en el que participa
 * (su Application está en status='accepted'). Distinta a project-detail
 * que es del emprendedor.
 */
@Component({
  selector: 'app-participating-project',
  standalone: true,
  imports: [CommonModule, MyTasksCardComponent, MyTasksListComponent],
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
}
