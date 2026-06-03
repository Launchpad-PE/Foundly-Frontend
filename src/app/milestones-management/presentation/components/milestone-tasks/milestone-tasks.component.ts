import { Component, computed, inject, input, OnInit, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MilestoneStore } from '../../../application/milestone-store';
import { MilestoneTaskStatus } from '../../../domain/enum/milestone-task-status.enum';
import { MilestoneTask } from '../../../domain/entities/milestone-task.entity';
import { CreateTaskModalComponent } from '../create-task-modal/create-task-modal.component';

@Component({
  selector: 'app-milestone-tasks',
  standalone: true,
  imports: [CommonModule, FormsModule, CreateTaskModalComponent],
  templateUrl: './milestone-tasks.component.html',
  styleUrls: ['./milestone-tasks.component.css']
})
export class MilestoneTasksComponent implements OnInit {
  private milestoneStore = inject(MilestoneStore);

  milestoneId = input.required<string>();
  assignees = input.required<Array<{ id: string; fullName: string }>>();
  canManage = input(false);
  onTaskUpdated = output<void>();

  showCreateModal = signal(false);
  editingTask = signal<MilestoneTask | null>(null);
  updatingTaskId = signal<string | null>(null);

  tasks = computed(() => this.milestoneStore.currentMilestoneTasks());
  loading = this.milestoneStore.loading;

  // Estadísticas
  totalTasks = computed(() => this.tasks().length);
  completedTasks = computed(() => this.tasks().filter(t => t.isCompleted).length);
  pendingTasks = computed(() => this.tasks().filter(t => t.isPending).length);
  delayedTasks = computed(() => this.tasks().filter(t => t.isDelayed).length);

  completionPercentage = computed(() => {
    const total = this.totalTasks();
    if (total === 0) return 0;
    return Math.round((this.completedTasks() / total) * 100);
  });

  ngOnInit(): void {
    this.loadTasks();
  }

  async loadTasks(): Promise<void> {
    const milestone = await this.milestoneStore.loadMilestone(this.milestoneId());
    if (milestone) {
      this.milestoneStore.currentMilestoneTasks.set(milestone.tasks);
    }
  }

  openCreateModal(): void {
    this.showCreateModal.set(true);
  }

  closeCreateModal(): void {
    this.showCreateModal.set(false);
    this.editingTask.set(null);
  }

  editTask(task: MilestoneTask): void {
    this.editingTask.set(task);
    this.showCreateModal.set(true);
  }

  async onTaskSaved(): Promise<void> {
    this.closeCreateModal();
    await this.loadTasks();
    this.onTaskUpdated.emit();
  }

  async toggleTaskStatus(task: MilestoneTask): Promise<void> {
    if (this.updatingTaskId()) return;

    this.updatingTaskId.set(task.id);
    try {
      await this.milestoneStore.updateTaskStatus(task.id, !task.isCompleted);
      await this.loadTasks();
      this.onTaskUpdated.emit();
    } finally {
      this.updatingTaskId.set(null);
    }
  }

  async deleteTask(taskId: string): Promise<void> {
    if (!confirm('¿Eliminar esta tarea?')) return;

    this.updatingTaskId.set(taskId);
    try {
      await this.milestoneStore.deleteTask(taskId);
      await this.loadTasks();
      this.onTaskUpdated.emit();
    } finally {
      this.updatingTaskId.set(null);
    }
  }

  getAssigneeName(assigneeId: string): string {
    const assignee = this.assignees().find(a => a.id === assigneeId);
    return assignee?.fullName || 'Sin asignar';
  }

  getStatusIcon(status: MilestoneTaskStatus): string {
    switch (status) {
      case MilestoneTaskStatus.COMPLETED: return '✓';
      case MilestoneTaskStatus.PENDING: return '○';
      case MilestoneTaskStatus.DELAYED: return '⚠';
      default: return '○';
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

  // Agrega este método para contar los checklist completados
  getCompletedChecklistCount(checklist: any[]): number {
    return checklist.filter(step => step.isDone()).length;
  }

// Agrega también el método getShortUrl si no existe
  getShortUrl(url: string): string {
    if (url.length <= 40) return url;
    return url.substring(0, 40) + '...';
  }

// Agrega el método toggleChecklistStep
  async toggleChecklistStep(task: MilestoneTask, stepIndex: number): Promise<void> {
    if (task.isCompleted) return;

    task.toggleChecklistStep(stepIndex);
    // Recargar para reflejar cambios
    await this.loadTasks();
    this.onTaskUpdated.emit();
  }

  // Agrega este método
  truncateUrl(url: string): string {
    if (!url) return '';
    if (url.length <= 50) return url;
    return url.substring(0, 50) + '...';
  }
}
