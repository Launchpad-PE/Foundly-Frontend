import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { ProjectStore } from '../../../application/project-store';
import { Project } from '../../../domain/entities/project.entity';
import { UserStore } from '../../../../iam/application/user.store';
import { TaskStore } from '../../../../task-management/application/task.store';
import { MyTasksCardComponent } from '../../../../task-management/presentation/components/my-tasks-card/my-tasks-card';
import { MyTasksListComponent } from '../../../../task-management/presentation/components/my-tasks-list/my-tasks-list';
import {
  MyMilestoneTasksComponent
} from '../../../../milestones-management/presentation/components/my-milestone-tasks/my-milestone-tasks.component';

type ParticipatingTab = 'inicio' | 'tareas' | 'hitos';

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
  readonly taskStore = inject(TaskStore);

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

  // ── Stats del colaborador ──────────────────────────────
  readonly myTasks = computed(() =>
    this.taskStore.projectTasks().filter(t =>
      t.assigneeId.toString() === this.currentUserId
    )
  );
  readonly myCompletedCount = computed(() =>
    this.myTasks().filter(t => t.isCompleted()).length
  );
  readonly myTotalCount = computed(() => this.myTasks().length);
  readonly myCompletionPct = computed(() => {
    const total = this.myTotalCount();
    if (total === 0) return 0;
    return Math.round((this.myCompletedCount() / total) * 100);
  });
  readonly myRingStyle = computed(() => {
    const pct = this.myCompletionPct();
    return `conic-gradient(#6C63FF ${pct}%, #e8e6ff ${pct}%)`;
  });
  readonly nextDelivery = computed(() => {
    const pending = this.myTasks()
      .filter(t => !t.isCompleted())
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
    return pending.length > 0 ? pending[0].dueDate : null;
  });

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/projects']);
      return;
    }
    const p = await this.projectStore.loadProject(id);
    this.project.set(p);
    if (p) {
      await this.taskStore.loadTasksByProject(p.id);
    }
    this.loading.set(false);
  }

  setTab(tab: ParticipatingTab): void {
    this.activeTab.set(tab);
  }

  goBack(): void {
    this.router.navigate(['/projects']);
  }

  async refreshTasks(): Promise<void> {
    if (this.projectId) {
      await this.taskStore.loadTasksByProject(this.projectId);
    }
  }

  formatDate(d: Date): string {
    if (!d) return '—';
    const x = new Date(d);
    const dd = String(x.getDate()).padStart(2, '0');
    const mm = String(x.getMonth() + 1).padStart(2, '0');
    return `${dd}-${mm}-${x.getFullYear()}`;
  }
}
