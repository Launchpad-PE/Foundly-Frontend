import { Component, computed, inject, input, OnDestroy, OnInit, output, signal } from '@angular/core';
import { MilestoneStore } from '../../application/MilestoneStore';
import { Milestone } from '../../domain/entities/milestone.entity';
import { MilestoneCardComponent } from '../milestone-card/milestone-card.component';
import { CommonModule } from '@angular/common';
import { CreateMilestoneModalComponent } from '../create-milestone-modal/create-milestone-modal.component';

@Component({
  selector: 'app-milestone-list',
  standalone: true,
  imports: [MilestoneCardComponent, CommonModule, CreateMilestoneModalComponent],
  templateUrl: './milestone-list.component.html',
  styleUrl: './milestone-list.component.css',
})
export class MilestoneListComponent implements OnInit, OnDestroy {
  private milestoneStore = inject(MilestoneStore);

  // Inputs
  projectId = input.required<string>();
  creatorId = input.required<string>();

  // Outputs
  milestoneSelected = output<Milestone>();

  // State
  showCreateModal = signal(false);

  // Signals from store
  milestones = this.milestoneStore.projectMilestones;
  loading = this.milestoneStore.loading;
  error = this.milestoneStore.error;

  // Computed values
  hasMilestones = computed(() => this.milestones().length > 0);
  pendingCount = computed(() => this.milestones().filter((m) => m.isPending).length);
  completedCount = computed(() => this.milestones().filter((m) => m.isCompleted).length);
  delayedCount = computed(() => this.milestones().filter((m) => m.isDelayed).length);

  completionPercentage = computed(() => {
    const total = this.milestones().length;
    if (total === 0) return 0;
    return Math.round((this.completedCount() / total) * 100);
  });

  ngOnInit(): void {
    this.loadMilestones();
  }

  ngOnDestroy(): void {
    this.milestoneStore.reset();
  }

  async loadMilestones(): Promise<void> {
    await this.milestoneStore.loadMilestonesByProject(this.projectId());
  }

  openCreateModal(): void {
    this.showCreateModal.set(true);
  }

  closeCreateModal(): void {
    this.showCreateModal.set(false);
  }

  async onMilestoneCreated(milestone: Milestone): Promise<void> {
    this.closeCreateModal();
    // Recargar la lista para mostrar el nuevo hito
    await this.loadMilestones();
  }

  onMilestoneClick(milestone: Milestone): void {
    this.milestoneSelected.emit(milestone);
  }

  async onMilestoneDeleted(milestoneId: string): Promise<void> {
    if (confirm('¿Eliminar este hito? Se perderán todas las tareas asociadas.')) {
      await this.milestoneStore.deleteMilestone(milestoneId);
    }
  }

  refresh(): void {
    this.loadMilestones();
  }
}
