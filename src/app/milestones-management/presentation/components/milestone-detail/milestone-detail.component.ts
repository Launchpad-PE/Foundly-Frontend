import { Component, inject, input, OnInit, output, signal } from '@angular/core';
import { Milestone } from '../../../domain/entities/milestone.entity';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MilestoneStore } from '../../../application/milestone-store';
import { MilestoneTasksComponent } from '../milestone-tasks/milestone-tasks.component';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-milestone-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, MilestoneTasksComponent, TranslatePipe],
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

  ngOnInit(): void {
    this.loadMilestone();
  }

  async loadMilestone(): Promise<void> {
    const m = await this.milestoneStore.loadMilestone(this.milestoneId());
    this.milestone.set(m);
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


  goBack(): void {
    this.closed.emit();
  }

  onTaskUpdated(): void {
    this.loadMilestone();
    this.updated.emit(this.milestone()!);
  }

  truncateUrl(url: string): string {
    if (!url) return '';
    if (url.length <= 40) return url;
    return url.substring(0, 40) + '...';
  }
}
