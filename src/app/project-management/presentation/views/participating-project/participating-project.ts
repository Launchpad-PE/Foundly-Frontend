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
import { MilestoneStore } from '../../../../milestones-management/application/milestone-store';
import { Milestone } from '../../../../milestones-management/domain/entities/milestone.entity';
import { TranslatePipe } from '@ngx-translate/core';

type ParticipatingTab = 'inicio' | 'tareas' | 'hitos';

@Component({
  selector: 'app-participating-project',
  standalone: true,
  imports: [CommonModule, MyTasksCardComponent, MyTasksListComponent, MyMilestoneTasksComponent, TranslatePipe],
  templateUrl: './participating-project.html',
  styleUrls: ['./participating-project.css']
})
export class ParticipatingProjectComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private projectStore = inject(ProjectStore);
  private userStore = inject(UserStore);
  readonly taskStore = inject(TaskStore);
  private milestoneStore = inject(MilestoneStore);

  project = signal<Project | null>(null);
  activeTab = signal<ParticipatingTab>('inicio');
  loading = signal<boolean>(true);

  // Signals para milestones
  readonly projectMilestones = this.milestoneStore.projectMilestones;
  readonly loadingMilestones = this.milestoneStore.loading;

  get projectName(): string {
    return this.project()?.name.getValue() ?? '';
  }

  get projectId(): string {
    return this.project()?.id ?? '';
  }

  get currentUserId(): string {
    return this.userStore.currentUser()?.id ?? '';
  }

  // ── Stats del colaborador (tareas) ──────────────────────────────
  readonly myTasks = computed(() =>
    this.taskStore.projectTasks().filter(t =>
      t.assigneeId.toString() === this.currentUserId
    )
  );
  readonly myCompletedCount = computed(() =>
    this.myTasks().filter(t => t.isCompleted()).length
  );
  readonly myTotalCount = computed(() => this.myTasks().length);
  readonly myTasksCompletionPct = computed(() => {
    const total = this.myTotalCount();
    if (total === 0) return 0;
    return Math.round((this.myCompletedCount() / total) * 100);
  });
  readonly myTasksRingStyle = computed(() => {
    const pct = this.myTasksCompletionPct();
    return `conic-gradient(#6C63FF ${pct}%, #e8e6ff ${pct}%)`;
  });

  // Próxima tarea pendiente
  readonly nextPendingTask = computed(() => {
    const pending = this.myTasks()
      .filter(t => !t.isCompleted())
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
    return pending.length > 0 ? pending[0] : null;
  });

  // Próximo hito pendiente (con tareas incompletas del usuario)
  readonly nextPendingMilestone = computed(() => {
    const userId = this.currentUserId;

    const pendingMilestones = this.projectMilestones()
      .filter(milestone => {
        const userTasks = milestone.tasks.filter(t => t.assigneeId.toString() === userId);
        if (userTasks.length === 0) return false;
        const allUserTasksCompleted = userTasks.every(t => t.isCompleted);
        return !allUserTasksCompleted;
      })
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

    return pendingMilestones.length > 0 ? pendingMilestones[0] : null;
  });

  // Próxima entrega combinada (tarea o hito pendiente más cercano)
  readonly nextDelivery = computed(() => {
    const nextTask = this.nextPendingTask();
    const nextMilestone = this.nextPendingMilestone();

    if (!nextTask && !nextMilestone) return null;
    if (!nextTask) return nextMilestone?.dueDate ?? null;
    if (!nextMilestone) return nextTask.dueDate;

    // Comparar fechas y devolver la más cercana
    const taskDate = nextTask.dueDate.getTime();
    const milestoneDate = new Date(nextMilestone.dueDate).getTime();

    return taskDate < milestoneDate ? nextTask.dueDate : nextMilestone.dueDate;
  });

  // Tipo de próxima entrega (para mostrar ícono diferente o tooltip)
  readonly nextDeliveryType = computed(() => {
    const nextTask = this.nextPendingTask();
    const nextMilestone = this.nextPendingMilestone();

    if (!nextTask && !nextMilestone) return null;
    if (!nextTask) return 'milestone';
    if (!nextMilestone) return 'task';

    const taskDate = nextTask.dueDate.getTime();
    const milestoneDate = new Date(nextMilestone.dueDate).getTime();

    return taskDate < milestoneDate ? 'task' : 'milestone';
  });

  // Nombre de la próxima entrega
  readonly nextDeliveryName = computed(() => {
    const nextTask = this.nextPendingTask();
    const nextMilestone = this.nextPendingMilestone();
    const type = this.nextDeliveryType();

    if (type === 'task' && nextTask) {
      return nextTask.title.getValue();
    } else if (type === 'milestone' && nextMilestone) {
      return nextMilestone.title.getValue();
    }
    return null;
  });

  // ── Stats del colaborador (hitos alcanzados) ────────────────────
  // Hitos que el colaborador ha completado (todas sus tareas completadas)
  readonly myMilestones = computed(() => {
    const userId = this.currentUserId;
    return this.projectMilestones().filter(milestone => {
      const userTasks = milestone.tasks.filter(t => t.assigneeId.toString() === userId);
      if (userTasks.length === 0) return false;
      return userTasks.every(t => t.isCompleted);
    });
  });
  readonly myCompletedMilestonesCount = computed(() => this.myMilestones().length);
  readonly myTotalMilestonesCount = computed(() => {
    const userId = this.currentUserId;
    return this.projectMilestones().filter(milestone =>
      milestone.tasks.some(t => t.assigneeId.toString() === userId)
    ).length;
  });
  readonly myMilestonesCompletionPct = computed(() => {
    const total = this.myTotalMilestonesCount();
    if (total === 0) return 0;
    return Math.round((this.myCompletedMilestonesCount() / total) * 100);
  });
  readonly myMilestonesRingStyle = computed(() => {
    const pct = this.myMilestonesCompletionPct();
    return `conic-gradient(#059669 ${pct}%, #e8e6ff ${pct}%)`;
  });

  // Progreso general combinado del colaborador (60% tareas + 40% hitos)
  readonly myOverallCompletionPct = computed(() => {
    const tasksWeight = 0.6;
    const milestonesWeight = 0.4;

    if (this.myTotalCount() === 0 && this.myTotalMilestonesCount() === 0) return 0;
    if (this.myTotalMilestonesCount() === 0) return this.myTasksCompletionPct();
    if (this.myTotalCount() === 0) return this.myMilestonesCompletionPct();

    const weightedPct = (this.myTasksCompletionPct() * tasksWeight) +
      (this.myMilestonesCompletionPct() * milestonesWeight);
    return Math.round(weightedPct);
  });

  // Próximos hitos para el colaborador
  readonly upcomingMilestonesForUser = computed(() => {
    const userId = this.currentUserId;

    return this.projectMilestones()
      .filter(milestone => {
        const userTasks = milestone.tasks.filter(t => t.assigneeId.toString() === userId);
        if (userTasks.length === 0) return false;
        const allUserTasksCompleted = userTasks.every(t => t.isCompleted);
        return !allUserTasksCompleted;
      })
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 3);
  });

  // ── Lifecycle ───────────────────────────────────────────────────
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
      await this.milestoneStore.loadMilestonesByProject(p.id);
    }
    this.loading.set(false);
  }

  setTab(tab: ParticipatingTab): void {
    this.activeTab.set(tab);

    if (tab === 'inicio' && this.projectId) {
      this.refreshProjectData();
    }
  }

  async refreshProjectData(): Promise<void> {
    if (this.projectId) {
      await Promise.all([
        this.taskStore.loadTasksByProject(this.projectId),
        this.milestoneStore.loadMilestonesByProject(this.projectId)
      ]);
    }
  }

  goBack(): void {
    this.router.navigate(['/projects']);
  }

  async refreshTasks(): Promise<void> {
    if (this.projectId) {
      await this.taskStore.loadTasksByProject(this.projectId);
      await this.milestoneStore.loadMilestonesByProject(this.projectId);
    }
  }

  formatDate(d: Date): string {
    if (!d) return '—';
    const x = new Date(d);
    const dd = String(x.getDate()).padStart(2, '0');
    const mm = String(x.getMonth() + 1).padStart(2, '0');
    return `${dd}-${mm}-${x.getFullYear()}`;
  }

  getCompletedTasksCount(tasks: any[]): number {
    return tasks.filter(task => task.isCompleted).length;
  }

  // Agrega esto después de myOverallCompletionPct
  readonly myOverallRingStyle = computed(() => {
    const pct = this.myOverallCompletionPct();
    return `conic-gradient(#6C63FF ${pct}%, #e8e6ff ${pct}%)`;
  });
}
