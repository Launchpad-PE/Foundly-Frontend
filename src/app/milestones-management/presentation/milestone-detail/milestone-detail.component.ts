import { Component, inject, input, OnInit, output, signal } from '@angular/core';
import { Milestone } from '../../domain/entities/milestone.entity';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MilestoneStore } from '../../application/milestone-store';
import { MilestoneTasksComponent } from '../milestone-tasks/milestone-tasks.component';

@Component({
  selector: 'app-milestone-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, MilestoneTasksComponent],
  templateUrl: './milestone-detail.component.html',
  styleUrls: ['./milestone-detail.component.css']
})
export class MilestoneDetailComponent implements OnInit {
  private milestoneStore = inject(MilestoneStore);

  milestoneId = input.required<string>();
  assignees = input.required<Array<{ id: string; fullName: string }>>();
  canManage = input(false);
  closed = output();
  updated = output<Milestone>();

  milestone = signal<Milestone | null>(null);
  loading = this.milestoneStore.loading;
  isEditing = signal(false);

  // Edit form
  editTitle = '';
  editDescription = '';
  editDueDate = '';

  ngOnInit(): void {
    this.loadMilestone();
  }

  async loadMilestone(): Promise<void> {
    const m = await this.milestoneStore.loadMilestone(this.milestoneId());
    this.milestone.set(m);
    if (m) {
      this.editTitle = m.title.getValue();
      this.editDescription = m.description.getValue();
      this.editDueDate = m.dueDate.toISOString().split('T')[0];
    }
  }

  get statusLabel(): string {
    const m = this.milestone();
    if (!m) return '';
    if (m.isCompleted) return 'Completado';
    if (m.isDelayed) return 'Atrasado';
    return 'Pendiente';
  }

  get statusClass(): string {
    const m = this.milestone();
    if (!m) return '';
    if (m.isCompleted) return 'status-completed';
    if (m.isDelayed) return 'status-delayed';
    return 'status-pending';
  }

  get formattedDueDate(): string {
    const m = this.milestone();
    if (!m) return '';
    return m.dueDate.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  get isOverdue(): boolean {
    const m = this.milestone();
    if (!m || m.isCompleted) return false;
    return new Date() > m.dueDate;
  }

  get tasksCompletion(): number {
    const m = this.milestone();
    if (!m) return 0;
    return m.tasksCompletionPercentage;
  }

  // Método para truncar URLs largas
  truncateUrl(url: string): string {
    if (url.length <= 40) return url;
    return url.substring(0, 40) + '...';
  }

  startEditing(): void {
    const m = this.milestone();
    if (m && !m.isCompleted) {
      this.isEditing.set(true);
    }
  }

  cancelEditing(): void {
    this.isEditing.set(false);
    const m = this.milestone();
    if (m) {
      this.editTitle = m.title.getValue();
      this.editDescription = m.description.getValue();
      this.editDueDate = m.dueDate.toISOString().split('T')[0];
    }
  }

  async saveMilestone(): Promise<void> {
    const m = this.milestone();
    if (!m) return;

    await this.milestoneStore.updateMilestone(m.id, {
      title: this.editTitle,
      description: this.editDescription,
      dueDate: new Date(this.editDueDate)
    });

    await this.loadMilestone();
    this.isEditing.set(false);
    this.updated.emit(this.milestone()!);
  }

  async deleteMilestone(): Promise<void> {
    if (!confirm('¿Eliminar este hito? Se perderán todas las tareas asociadas.')) return;

    const m = this.milestone();
    if (m) {
      await this.milestoneStore.deleteMilestone(m.id);
      this.closed.emit();
    }
  }

  close(): void {
    this.closed.emit();
  }

  onTaskUpdated(): void {
    this.loadMilestone();
    this.updated.emit(this.milestone()!);
  }
}
