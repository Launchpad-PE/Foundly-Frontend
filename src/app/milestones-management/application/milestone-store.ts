import { Injectable, signal, computed, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Milestone } from '../domain/entities/milestone.entity';
import { MilestoneTask } from '../domain/entities/milestone-task.entity';
import { MilestoneApi } from '../infrastructure/milestone-api';
import { MilestoneStatus } from '../domain/enum/milestone-status.enum';
import { MilestoneTaskStatus } from '../domain/enum/milestone-task-status.enum';

export interface CreateMilestoneData {
  projectId: string;
  creatorId: string;
  title: string;
  description: string;
  dueDate: Date;
  tools?: string[];
  generalComment?: string;
  attachments?: string[];
}

export interface CreateMilestoneTaskData {
  title: string;
  description: string;
  assigneeId: string;
  checklist?: Array<{ description: string; done?: boolean }>;
  attachments?: string[];
}

export interface UpdateMilestoneData {
  title?: string;
  description?: string;
  dueDate?: Date;
  tools?: string[];
  generalComment?: string;
  attachments?: string[];
}

@Injectable({ providedIn: 'root' })
export class MilestoneStore {
  private milestoneApi = inject(MilestoneApi);

  // ============= State Signals =============

  /** Lista de hitos del proyecto actual */
  readonly projectMilestones = signal<Milestone[]>([]);

  /** Hito actualmente seleccionado/detallado */
  readonly currentMilestone = signal<Milestone | null>(null);

  /** Tareas del hito actual */
  readonly currentMilestoneTasks = signal<MilestoneTask[]>([]);

  /** Estado de carga */
  readonly loading = signal<boolean>(false);

  /** Error */
  readonly error = signal<string | null>(null);

  // ============= Computed Signals =============

  /** Cantidad total de hitos */
  readonly milestonesCount = computed(() => this.projectMilestones().length);

  /** Hitos pendientes */
  readonly pendingMilestones = computed(() =>
    this.projectMilestones().filter((m) => m.status === MilestoneStatus.PENDING),
  );

  /** Hitos completados */
  readonly completedMilestones = computed(() =>
    this.projectMilestones().filter((m) => m.status === MilestoneStatus.COMPLETED),
  );

  /** Hitos atrasados */
  readonly delayedMilestones = computed(() =>
    this.projectMilestones().filter((m) => m.status === MilestoneStatus.DELAYED),
  );

  /** Porcentaje de completado general */
  readonly completionPercentage = computed(() => {
    const total = this.projectMilestones().length;
    if (total === 0) return 0;
    const completed = this.completedMilestones().length;
    return Math.round((completed / total) * 100);
  });

  /** Último hito creado/actualizado */
  readonly lastUpdatedMilestone = computed(() => {
    const milestones = this.projectMilestones();
    if (milestones.length === 0) return null;
    return milestones.reduce((latest, current) =>
      current.updatedAt > latest.updatedAt ? current : latest,
    );
  });

  // ============= Private Helpers =============

  private setLoading(value: boolean): void {
    this.loading.set(value);
  }

  private setError(message: string | null): void {
    this.error.set(message);
  }

  private clearError(): void {
    this.error.set(null);
  }

  // ============= Milestone CRUD =============

  /**
   * Cargar hitos de un proyecto
   */
  async loadMilestonesByProject(projectId: string): Promise<Milestone[]> {
    this.setLoading(true);
    this.clearError();

    try {
      const milestones = await firstValueFrom(this.milestoneApi.getMilestonesByProject(projectId));
      this.projectMilestones.set(milestones);
      return milestones;
    } catch (err: any) {
      const message = err?.message || 'Error al cargar los hitos del proyecto';
      this.setError(message);
      console.error('Error loading milestones:', err);
      return [];
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Cargar un hito específico por ID
   */
  async loadMilestone(milestoneId: string): Promise<Milestone | null> {
    this.setLoading(true);
    this.clearError();

    try {
      const milestone = await firstValueFrom(this.milestoneApi.getMilestone(milestoneId));
      this.currentMilestone.set(milestone);
      this.currentMilestoneTasks.set(milestone.tasks);
      return milestone;
    } catch (err: any) {
      if (err?.status === 404) {
        console.log('Milestone not found:', milestoneId);
        return null;
      }
      const message = err?.message || 'Error al cargar el hito';
      this.setError(message);
      return null;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Crear un nuevo hito
   */
  async createMilestone(data: {
    projectId: string;
    creatorId: string;
    title: string;
    description: string;
    dueDate: Date;
    tools: string[] | undefined;
    generalComment: string | undefined;
    attachments: string[] | undefined;
    tasks: {
      title: string;
      description: string;
      assigneeId: string;
      checklist: Array<{ description: string; done: boolean }>;
      attachments: string[];
    }[];
  }): Promise<Milestone> {
    this.setLoading(true);
    this.clearError();

    try {
      // Mapear las tareas sin milestoneId (se asigna dentro del milestone)
      const taskProps = data.tasks?.map(task => ({
        title: task.title,
        description: task.description,
        assigneeId: task.assigneeId,
        checklist: task.checklist,
        attachments: task.attachments
      }));

      const milestone = Milestone.create({
        projectId: data.projectId,
        creatorId: data.creatorId,
        title: data.title,
        description: data.description,
        dueDate: data.dueDate,
        tools: data.tools,
        generalComment: data.generalComment,
        attachments: data.attachments,
        tasks: taskProps
      });

      const saved = await firstValueFrom(this.milestoneApi.createMilestone(milestone));

      // Actualizar la lista de hitos
      this.projectMilestones.update((list) => [saved, ...list]);

      return saved;
    } catch (err: any) {
      const message = err?.message || 'Error al crear el hito';
      this.setError(message);
      throw err;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Actualizar un hito existente
   */
  async updateMilestone(milestoneId: string, data: UpdateMilestoneData): Promise<Milestone> {
    this.setLoading(true);
    this.clearError();

    try {
      const current = this.projectMilestones().find((m) => m.id === milestoneId);
      if (!current) {
        throw new Error('Milestone not found');
      }

      // Crear un nuevo milestone con los datos actualizados
      const updated = Milestone.create({
        id: milestoneId,
        projectId: current.projectId.toString(),
        creatorId: current.creatorId.toString(),
        title: data.title ?? current.title.getValue(),
        description: data.description ?? current.description.getValue(),
        dueDate: data.dueDate ?? current.dueDate,
        tools: data.tools ?? current.tools.map((t) => t.getName()),
        generalComment: data.generalComment ?? current.generalComment ?? undefined,
        attachments: data.attachments ?? current.attachments.map((a) => a.getValue()),
        status: current.status,
        createdAt: current.createdAt,
        updatedAt: new Date(),
      });

      const saved = await firstValueFrom(this.milestoneApi.updateMilestone(updated));

      // Actualizar en la lista
      this.projectMilestones.update((list) => list.map((m) => (m.id === milestoneId ? saved : m)));

      if (this.currentMilestone()?.id === milestoneId) {
        this.currentMilestone.set(saved);
      }

      return saved;
    } catch (err: any) {
      const message = err?.message || 'Error al actualizar el hito';
      this.setError(message);
      throw err;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Eliminar un hito
   */
  async deleteMilestone(milestoneId: string): Promise<void> {
    this.setLoading(true);
    this.clearError();

    try {
      await firstValueFrom(this.milestoneApi.deleteMilestone(milestoneId));

      // Remover de la lista
      this.projectMilestones.update((list) => list.filter((m) => m.id !== milestoneId));

      if (this.currentMilestone()?.id === milestoneId) {
        this.currentMilestone.set(null);
        this.currentMilestoneTasks.set([]);
      }
    } catch (err: any) {
      const message = err?.message || 'Error al eliminar el hito';
      this.setError(message);
      throw err;
    } finally {
      this.setLoading(false);
    }
  }

  // ============= Task Management =============

  /**
   * Agregar una tarea a un hito
   */
  async addTaskToMilestone(
    milestoneId: string,
    taskData: CreateMilestoneTaskData,
  ): Promise<MilestoneTask> {
    this.setLoading(true);
    this.clearError();

    try {
      const task = MilestoneTask.create({
        milestoneId: milestoneId,
        title: taskData.title,
        description: taskData.description,
        assigneeId: taskData.assigneeId,
        checklist: taskData.checklist,
        attachments: taskData.attachments,
      });

      const savedTask = await firstValueFrom(
        this.milestoneApi.addTaskToMilestone(milestoneId, task),
      );

      // Actualizar el milestone en cache
      await this.refreshMilestone(milestoneId);

      // Actualizar tareas del hito actual si es necesario
      if (this.currentMilestone()?.id === milestoneId) {
        this.currentMilestoneTasks.update((tasks) => [...tasks, savedTask]);
      }

      return savedTask;
    } catch (err: any) {
      const message = err?.message || 'Error al agregar la tarea al hito';
      this.setError(message);
      throw err;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Actualizar estado de una tarea
   */
  async updateTaskStatus(taskId: string, completed: boolean): Promise<MilestoneTask> {
    this.setLoading(true);
    this.clearError();

    try {
      const newStatus = completed ? MilestoneTaskStatus.COMPLETED : MilestoneTaskStatus.PENDING;
      const updatedTask = await firstValueFrom(
        this.milestoneApi.updateTaskStatus(taskId, newStatus),
      );

      // Encontrar el milestone que contiene esta tarea y refrescarlo
      const milestone = this.projectMilestones().find((m) => m.tasks.some((t) => t.id === taskId));

      if (milestone) {
        await this.refreshMilestone(milestone.id);
      }

      // Actualizar tareas del hito actual
      this.currentMilestoneTasks.update((tasks) =>
        tasks.map((t) => (t.id === taskId ? updatedTask : t)),
      );

      return updatedTask;
    } catch (err: any) {
      const message = err?.message || 'Error al actualizar el estado de la tarea';
      this.setError(message);
      throw err;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Eliminar una tarea
   */
  async deleteTask(taskId: string): Promise<void> {
    this.setLoading(true);
    this.clearError();

    try {
      // Encontrar el milestone que contiene esta tarea
      const milestone = this.projectMilestones().find((m) => m.tasks.some((t) => t.id === taskId));

      await firstValueFrom(this.milestoneApi.deleteTask(taskId));

      if (milestone) {
        await this.refreshMilestone(milestone.id);
      }

      // Actualizar tareas del hito actual
      this.currentMilestoneTasks.update((tasks) => tasks.filter((t) => t.id !== taskId));
    } catch (err: any) {
      const message = err?.message || 'Error al eliminar la tarea';
      this.setError(message);
      throw err;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Refrescar un milestone específico
   */
  private async refreshMilestone(milestoneId: string): Promise<void> {
    try {
      const refreshed = await firstValueFrom(this.milestoneApi.getMilestone(milestoneId));

      // Actualizar en la lista
      this.projectMilestones.update((list) =>
        list.map((m) => (m.id === milestoneId ? refreshed : m)),
      );

      if (this.currentMilestone()?.id === milestoneId) {
        this.currentMilestone.set(refreshed);
        this.currentMilestoneTasks.set(refreshed.tasks);
      }
    } catch (err) {
      console.error('Error refreshing milestone:', err);
    }
  }

  // ============= Helper Methods =============

  /**
   * Obtener un hito por ID de la cache
   */
  getMilestoneById(milestoneId: string): Milestone | undefined {
    return this.projectMilestones().find((m) => m.id === milestoneId);
  }

  /**
   * Obtener tareas asignadas a un usuario específico
   */
  getTasksByAssignee(assigneeId: string): MilestoneTask[] {
    const allTasks: MilestoneTask[] = [];
    for (const milestone of this.projectMilestones()) {
      allTasks.push(...milestone.tasks);
    }
    return allTasks.filter((task) => task.assigneeId.toString() === assigneeId);
  }

  /**
   * Resetear todo el estado del store
   */
  reset(): void {
    this.projectMilestones.set([]);
    this.currentMilestone.set(null);
    this.currentMilestoneTasks.set([]);
    this.loading.set(false);
    this.error.set(null);
  }
}
