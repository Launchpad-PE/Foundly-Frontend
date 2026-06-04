import {
  Component, Input, OnInit, OnChanges, SimpleChanges,
  inject, signal, computed
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { TaskStore } from '../../../application/task.store';
import { Task } from '../../../domain/entities/task.entity';
import { TaskStatus } from '../../../domain/enum/task-status.enum';
import { TaskFormModalComponent, TaskFormSubmit } from '../task-form-modal/task-form-modal';
import { UserStore } from '../../../../iam/application/user.store';

export interface AssigneeOption {
  id: string;
  fullName: string;
}

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, FormsModule, TaskFormModalComponent],
  templateUrl: './task-list.html',
  styleUrls: ['./task-list.css']
})
export class TaskListComponent implements OnInit, OnChanges {
  @Input() projectId: string = '';
  @Input() assignees: AssigneeOption[] = [];

  private taskStore = inject(TaskStore);
  private userStore = inject(UserStore);
  private router = inject(Router);

  loading = this.taskStore.loading;
  error = this.taskStore.error;

  selectedAssignee = signal<string>('');
  selectedStatus = signal<string>('');
  searchInput = signal<string>('');
  showModal = signal<boolean>(false);

  showRescheduleModal = signal<boolean>(false);
  rescheduleTask = signal<Task | null>(null);
  rescheduleDate: string = '';
  rescheduling = signal<boolean>(false);
  rescheduleError = signal<string>('');

  readonly filteredTasks = computed(() => {
    const assignee = this.selectedAssignee();
    const status = this.selectedStatus();
    const term = this.searchInput().trim().toLowerCase();
    return this.taskStore.projectTasks().filter(t => {
      if (assignee && t.assigneeId.toString() !== assignee) return false;
      if (term && !t.title.getValue().toLowerCase().includes(term)) return false;
      if (status) {
        const ds = t.getDisplayStatus();
        if (status === 'pendiente' && ds !== TaskStatus.PENDING) return false;
        if (status === 'atrasado' && ds !== TaskStatus.DELAYED) return false;
        if (status === 'completado' && ds !== TaskStatus.COMPLETED) return false;
      }
      return true;
    });
  });

  ngOnInit(): void {
    if (this.projectId) this.taskStore.loadTasksByProject(this.projectId);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['projectId'] && this.projectId) {
      this.taskStore.loadTasksByProject(this.projectId);
    }
  }

  applySearch(): void {
    this.searchInput.set(this.searchInput());
  }

  getAssigneeName(userId: string): string {
    return this.assignees.find(a => a.id === userId)?.fullName ?? userId;
  }

  getInitials(fullName: string): string {
    return fullName.split(' ').filter(p => p.length > 0).slice(0, 2)
      .map(p => p[0].toUpperCase()).join('');
  }

  formatDate(date: Date): string {
    const d = new Date(date);
    const day = String(d.getUTCDate()).padStart(2, '0');
    const month = String(d.getUTCMonth() + 1).padStart(2, '0');
    const year = d.getUTCFullYear();
    return `${day}/${month}/${year}`;
  }

  displayStatus(task: Task): TaskStatus {
    return task.getDisplayStatus();
  }

  statusLabel(task: Task): string {
    const s = this.displayStatus(task);
    switch (s) {
      case TaskStatus.COMPLETED: return 'Completado';
      case TaskStatus.DELAYED: return 'Retrasado';
      default: return 'Pendiente';
    }
  }

  statusClass(task: Task): string {
    const s = this.displayStatus(task);
    return `pill-${s}`;
  }

  isDelayed(task: Task): boolean {
    return task.isDelayed();
  }

  viewTask(task: Task): void {
    this.router.navigate(['/projects', this.projectId, 'tasks', task.id]);
  }

  openCreateModal(): void {
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  async onFormSubmit(data: TaskFormSubmit): Promise<void> {
    console.log('📅 FECHA RECIBIDA DEL FORMULARIO:', data.dueDate);
    console.log('📅 TIPO:', typeof data.dueDate);

    const creatorId = this.userStore.currentUser()?.id;
    if (!creatorId) {
      alert('Debes iniciar sesión');
      return;
    }
    try {
      await this.taskStore.createTask({
        projectId: this.projectId,
        creatorId,
        assigneeId: data.assigneeId,
        title: data.title,
        description: data.description,
        dueDate: data.dueDate,
        checklist: data.checklist,
        attachments: data.attachments,
        tools: data.tools,
        comment: data.comment
      });
      this.closeModal();
    } catch (err: any) {
      alert(err?.message ?? 'Error al crear la tarea');
    }
  }

  showDeleteModal = signal<boolean>(false);
  deleteTargetTask = signal<Task | null>(null);
  deleting = signal<boolean>(false);

  openDeleteModal(task: Task): void {
    this.deleteTargetTask.set(task);
    this.showDeleteModal.set(true);
  }

  closeDeleteModal(): void {
    this.showDeleteModal.set(false);
    this.deleteTargetTask.set(null);
  }

  async confirmDelete(): Promise<void> {
    const task = this.deleteTargetTask();
    if (!task) return;
    this.deleting.set(true);
    try {
      await this.taskStore.deleteTask(task.id);
      this.closeDeleteModal();
    } catch (err: any) {
      alert(err?.message ?? 'Error al eliminar la tarea');
    } finally {
      this.deleting.set(false);
    }
  }

  async deleteTask(task: Task): Promise<void> {
    this.openDeleteModal(task);
  }

  reschedule(task: Task): void {
    this.rescheduleTask.set(task);
    const d = new Date(task.dueDate);
    this.rescheduleDate = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
    this.rescheduleError.set('');
    this.showRescheduleModal.set(true);
  }

  closeRescheduleModal(): void {
    this.showRescheduleModal.set(false);
    this.rescheduleTask.set(null);
  }

  async confirmReschedule(): Promise<void> {
    if (!this.rescheduleDate) {
      this.rescheduleError.set('Selecciona una fecha.');
      return;
    }
    const [year, month, day] = this.rescheduleDate.split('-').map(Number);
    const utcDate = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));

    if (isNaN(utcDate.getTime())) {
      this.rescheduleError.set('Fecha inválida.');
      return;
    }
    const task = this.rescheduleTask();
    if (!task) return;
    this.rescheduling.set(true);
    this.rescheduleError.set('');
    try {
      await this.taskStore.rescheduleTask(task.id, utcDate);
      this.closeRescheduleModal();
    } catch (err: any) {
      this.rescheduleError.set(err?.message ?? 'Error al reagendar.');
    } finally {
      this.rescheduling.set(false);
    }
  }
}
