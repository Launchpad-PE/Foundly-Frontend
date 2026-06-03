import { Component, computed, inject, input, OnInit, output, signal } from '@angular/core';
import { MilestoneTaskStatus } from '../../../domain/enum/milestone-task-status.enum';
import { MilestoneStore } from '../../../application/milestone-store';
import { MilestoneTask } from '../../../domain/entities/milestone-task.entity';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-my-milestone-tasks',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './my-milestone-tasks.component.html',
  styleUrl: './my-milestone-tasks.component.css',
})
export class MyMilestoneTasksComponent implements OnInit {
  private milestoneStore = inject(MilestoneStore);
  private router = inject(Router);

  projectId = input.required<string>();
  assigneeId = input.required<string>();
  onTaskUpdated = output<void>();

  updatingTaskId = signal<string | null>(null);
  loading = this.milestoneStore.loading;

  // Todas las tareas del proyecto
  allMilestones = this.milestoneStore.projectMilestones;

  // Filtrar solo las tareas asignadas al colaborador actual
  myTasks = computed(() => {
    const tasks: Array<{ task: MilestoneTask; milestoneTitle: string; milestoneId: string }> = [];

    for (const milestone of this.allMilestones()) {
      for (const task of milestone.tasks) {
        if (task.assigneeId.toString() === this.assigneeId()) {
          tasks.push({
            task,
            milestoneTitle: milestone.title.getValue(),
            milestoneId: milestone.id
          });
        }
      }
    }

    return tasks;
  });

  // Estadísticas
  totalTasks = computed(() => this.myTasks().length);
  completedTasks = computed(() => this.myTasks().filter(t => t.task.isCompleted).length);
  pendingTasks = computed(() => this.myTasks().filter(t => t.task.isPending).length);
  delayedTasks = computed(() => this.myTasks().filter(t => t.task.isDelayed).length);

  completionPercentage = computed(() => {
    const total = this.totalTasks();
    if (total === 0) return 0;
    return Math.round((this.completedTasks() / total) * 100);
  });

  ngOnInit(): void {
    this.loadData();
  }

  async loadData(): Promise<void> {
    await this.milestoneStore.loadMilestonesByProject(this.projectId());
  }

  async toggleTaskStatus(task: MilestoneTask): Promise<void> {
    if (this.updatingTaskId()) return;

    this.updatingTaskId.set(task.id);
    try {
      await this.milestoneStore.updateTaskStatus(task.id, !task.isCompleted);
      await this.loadData();
      this.onTaskUpdated.emit();
    } finally {
      this.updatingTaskId.set(null);
    }
  }

  getStatusClass(status: MilestoneTaskStatus): string {
    switch (status) {
      case MilestoneTaskStatus.COMPLETED: return 'task-completed';
      case MilestoneTaskStatus.PENDING: return 'task-pending';
      case MilestoneTaskStatus.DELAYED: return 'task-delayed';
      default: return 'task-pending';
    }
  }

  getShortUrl(url: string): string {
    if (url.length <= 40) return url;
    return url.substring(0, 40) + '...';
  }

  getCompletedChecklistCount(checklist: any[]): number {
    return checklist.filter(step => step.isDone()).length;
  }

  goToDeliverTask(taskId: string, milestoneId: string): void {
    this.router.navigate([
      `/projects/${this.projectId()}/hitos/${milestoneId}/tareas/${taskId}/entregar`
    ]);
  }
}
