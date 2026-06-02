import { Component, computed, input, output } from '@angular/core';
import { Milestone } from '../../domain/entities/milestone.entity';
import { MilestoneStatus } from '../../domain/enum/milestone-status.enum';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-milestone-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './milestone-card.component.html',
  styleUrl: './milestone-card.component.css',
})
export class MilestoneCardComponent {
  milestone = input.required<Milestone>();
  viewDetails = output<Milestone>();
  deleteMilestone = output<string>();

  // Computed values
  statusLabel = computed(() => {
    const status = this.milestone().status;
    switch (status) {
      case MilestoneStatus.PENDING: return 'Pendiente';
      case MilestoneStatus.COMPLETED: return 'Completado';
      case MilestoneStatus.DELAYED: return 'Atrasado';
      default: return 'Pendiente';
    }
  });

  statusClass = computed(() => {
    const status = this.milestone().status;
    switch (status) {
      case MilestoneStatus.PENDING: return 'status-pending';
      case MilestoneStatus.COMPLETED: return 'status-completed';
      case MilestoneStatus.DELAYED: return 'status-delayed';
      default: return 'status-pending';
    }
  });

  totalTasks = computed(() => this.milestone().tasks.length);

  completedTasks = computed(() =>
    this.milestone().tasks.filter(t => t.isCompleted).length
  );

  tasksProgress = computed(() => {
    const total = this.totalTasks();
    if (total === 0) return 0;
    return Math.round((this.completedTasks() / total) * 100);
  });

  isOverdue = computed(() => {
    if (this.milestone().isCompleted) return false;
    return new Date() > new Date(this.milestone().dueDate);
  });

  canDelete = computed(() => !this.milestone().isCompleted);

  formattedDueDate = computed(() => {
    const date = this.milestone().dueDate;
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  });

  shortDescription = computed(() => {
    const desc = this.milestone().description.getValue();
    if (desc.length <= 100) return desc;
    return desc.substring(0, 100) + '...';
  });

  onViewDetails(): void {
    this.viewDetails.emit(this.milestone());
  }

  onDelete(): void {
    this.deleteMilestone.emit(this.milestone().id);
  }
}
