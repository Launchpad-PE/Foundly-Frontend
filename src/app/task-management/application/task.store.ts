import { Injectable, signal, computed, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { Task } from '../domain/entities/task.entity';
import { TaskApi } from '../infrastructure/task-api';
import { TaskStatus } from '../domain/enum/task-status.enum';

export interface CreateTaskData {
  projectId: string;
  assigneeId: string;
  creatorId: string;
  title: string;
  description: string;
  dueDate: string | Date;
  checklist?: Array<{ description: string; done?: boolean }>;
  attachments?: string[];
  tools?: string[];
  comment?: string | null;
}

@Injectable({ providedIn: 'root' })
export class TaskStore {
  // State signals
  readonly projectTasks = signal<Task[]>([]);
  readonly userTasks = signal<Task[]>([]);
  readonly currentTask = signal<Task | null>(null);
  readonly loading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  // Filtros UI
  readonly assigneeFilter = signal<string>(''); // userId, '' = todos
  readonly searchTerm = signal<string>('');

  private taskApi = inject(TaskApi);

  readonly filteredProjectTasks = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const assignee = this.assigneeFilter();
    return this.projectTasks().filter(t => {
      if (assignee && t.assigneeId.toString() !== assignee) return false;
      if (term && !t.title.getValue().toLowerCase().includes(term)) return false;
      return true;
    });
  });

  readonly pendingTasks = computed(() =>
    this.projectTasks().filter(t => !t.isCompleted())
  );
  readonly completedTasks = computed(() =>
    this.projectTasks().filter(t => t.isCompleted())
  );
  readonly delayedTasks = computed(() =>
    this.projectTasks().filter(t => t.isDelayed())
  );

  private setLoading(v: boolean): void { this.loading.set(v); }
  private setError(m: string | null): void { this.error.set(m); }
  private clearError(): void { this.error.set(null); }

  async loadTasksByProject(projectId: string): Promise<Task[]> {
    this.setLoading(true);
    this.clearError();
    try {
      const tasks = await firstValueFrom(this.taskApi.getTasksByProject(projectId));
      this.projectTasks.set(tasks);
      return tasks;
    } catch (err: any) {
      this.setError(err?.message || 'Error al cargar tareas');
      return [];
    } finally {
      this.setLoading(false);
    }
  }

  async loadTasksByAssignee(assigneeId: string): Promise<Task[]> {
    this.setLoading(true);
    this.clearError();
    try {
      const tasks = await firstValueFrom(this.taskApi.getTasksByAssignee(assigneeId));
      this.userTasks.set(tasks);
      return tasks;
    } catch (err: any) {
      this.setError(err?.message || 'Error al cargar tareas del usuario');
      return [];
    } finally {
      this.setLoading(false);
    }
  }

  async loadTask(taskId: string): Promise<Task | null> {
    this.setLoading(true);
    this.clearError();
    try {
      const task = await firstValueFrom(this.taskApi.getTask(taskId));
      this.currentTask.set(task);
      return task;
    } catch (err: any) {
      if (err?.status === 404) return null;
      this.setError(err?.message || 'Error al cargar la tarea');
      return null;
    } finally {
      this.setLoading(false);
    }
  }

  async createTask(data: CreateTaskData): Promise<Task> {
    this.setLoading(true);
    this.clearError();
    try {
      const task = Task.create(data);
      const saved = await firstValueFrom(this.taskApi.createTask(task));
      this.projectTasks.update(list => [saved, ...list]);
      return saved;
    } catch (err: any) {
      this.setError(err?.message || 'Error al crear la tarea');
      throw err;
    } finally {
      this.setLoading(false);
    }
  }

  /** Reagendar (usado por el botón "Poner Nueva fecha"). Pasa por el dominio. */
  async rescheduleTask(taskId: string, newDueDate: Date): Promise<Task> {
    this.setLoading(true);
    this.clearError();
    try {
      const cached = this.projectTasks().find(t => t.id === taskId)
        ?? (this.currentTask()?.id === taskId ? this.currentTask() : null);
      const entity = cached ?? await firstValueFrom(this.taskApi.getTask(taskId));

      entity.reschedule(newDueDate); // dominio valida que no esté completada
      const saved = await firstValueFrom(this.taskApi.updateTask(entity));

      this.projectTasks.update(list => list.map(t => t.id === taskId ? saved : t));
      if (this.currentTask()?.id === taskId) this.currentTask.set(saved);
      return saved;
    } catch (err: any) {
      this.setError(err?.message || 'Error al reagendar la tarea');
      throw err;
    } finally {
      this.setLoading(false);
    }
  }

  /** El colaborador entrega la tarea (link + notas). Pasa por el dominio. */
  async completeTask(taskId: string, deliveryUrl: string, deliveryNotes?: string | null): Promise<Task> {
    this.setLoading(true);
    this.clearError();
    try {
      const cached = this.projectTasks().find(t => t.id === taskId)
        ?? this.userTasks().find(t => t.id === taskId)
        ?? (this.currentTask()?.id === taskId ? this.currentTask() : null);
      const entity = cached ?? await firstValueFrom(this.taskApi.getTask(taskId));

      entity.complete(deliveryUrl, deliveryNotes); // dominio valida no-doble-completada
      const saved = await firstValueFrom(this.taskApi.updateTask(entity));

      this.projectTasks.update(list => list.map(t => t.id === taskId ? saved : t));
      this.userTasks.update(list => list.map(t => t.id === taskId ? saved : t));
      if (this.currentTask()?.id === taskId) this.currentTask.set(saved);
      return saved;
    } catch (err: any) {
      this.setError(err?.message || 'Error al completar la tarea');
      throw err;
    } finally {
      this.setLoading(false);
    }
  }

  async deleteTask(taskId: string): Promise<void> {
    this.setLoading(true);
    this.clearError();
    try {
      await firstValueFrom(this.taskApi.deleteTask(taskId));
      this.projectTasks.update(list => list.filter(t => t.id !== taskId));
      this.userTasks.update(list => list.filter(t => t.id !== taskId));
      if (this.currentTask()?.id === taskId) this.currentTask.set(null);
    } catch (err: any) {
      this.setError(err?.message || 'Error al eliminar la tarea');
      throw err;
    } finally {
      this.setLoading(false);
    }
  }

  setAssigneeFilter(userId: string): void { this.assigneeFilter.set(userId); }
  setSearchTerm(term: string): void { this.searchTerm.set(term); }
  clearFilters(): void {
    this.assigneeFilter.set('');
    this.searchTerm.set('');
  }

  reset(): void {
    this.projectTasks.set([]);
    this.userTasks.set([]);
    this.currentTask.set(null);
    this.loading.set(false);
    this.error.set(null);
    this.clearFilters();
  }
}
