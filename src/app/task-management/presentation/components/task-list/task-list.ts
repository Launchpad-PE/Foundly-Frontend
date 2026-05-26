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
  /** Opciones para el dropdown "Por Colaborador" — postulantes aceptados del proyecto. */
  @Input() assignees: AssigneeOption[] = [];

  private taskStore = inject(TaskStore);
  private userStore = inject(UserStore);
  private router = inject(Router);

  loading = this.taskStore.loading;
  error = this.taskStore.error;

  selectedAssignee = signal<string>('');
  searchInput = signal<string>('');
  showModal = signal<boolean>(false);

  // Filtro reactivo, sincroniza con el store
  readonly filteredTasks = computed(() => {
    // Trigger reactivo manual
    const assignee = this.selectedAssignee();
    const term = this.searchInput().trim().toLowerCase();
    return this.taskStore.projectTasks().filter(t => {
      if (assignee && t.assigneeId.toString() !== assignee) return false;
      if (term && !t.title.getValue().toLowerCase().includes(term)) return false;
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
    // El cómputo ya es reactivo, este botón solo dispara el efecto visual
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
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
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
    // Vista de detalle se planea como ruta futura
    this.router.navigate(['/projects', this.projectId, 'tasks', task.id]);
  }

  openCreateModal(): void {
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  async onFormSubmit(data: TaskFormSubmit): Promise<void> {
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

  async deleteTask(task: Task): Promise<void> {
    if (!confirm(`¿Eliminar la tarea "${task.title.getValue()}"?`)) return;
    try {
      await this.taskStore.deleteTask(task.id);
    } catch (err: any) {
      alert(err?.message ?? 'Error al eliminar la tarea');
    }
  }

  async reschedule(task: Task): Promise<void> {
    const currentIso = task.dueDate.toISOString().slice(0, 10);
    const input = prompt('Nueva fecha de entrega (YYYY-MM-DD):', currentIso);
    if (!input) return;
    const newDate = new Date(input);
    if (isNaN(newDate.getTime())) {
      alert('Fecha inválida');
      return;
    }
    try {
      await this.taskStore.rescheduleTask(task.id, newDate);
    } catch (err: any) {
      alert(err?.message ?? 'Error al reagendar');
    }
  }
}
