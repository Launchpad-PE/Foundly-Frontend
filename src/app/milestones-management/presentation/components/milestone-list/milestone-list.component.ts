import { Component, computed, inject, input, OnDestroy, OnInit, output, signal } from '@angular/core';
import { MilestoneStore } from '../../../application/milestone-store';
import { Milestone } from '../../../domain/entities/milestone.entity';
import { MilestoneCardComponent } from '../milestone-card/milestone-card.component';
import { CommonModule } from '@angular/common';
import { CreateMilestoneModalComponent } from '../create-milestone-modal/create-milestone-modal.component';
import { RescheduleMilestoneModalComponent } from '../reschedule-milestone-modal/reschedule-milestone-modal.component';
import { DeleteMilestoneModalComponent } from '../delete-milestone-modal/delete-milestone-modal.component';
@Component({
  selector: 'app-milestone-list',
  standalone: true,
  imports: [MilestoneCardComponent, CommonModule, CreateMilestoneModalComponent, RescheduleMilestoneModalComponent, DeleteMilestoneModalComponent ],
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
  showRescheduleModal = signal(false);
  showDeleteModal = signal(false);
  selectedMilestoneForReschedule = signal<Milestone | null>(null);
  selectedMilestoneForDelete = signal<Milestone | null>(null);

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
    await this.loadMilestones();
  }

  onMilestoneClick(milestone: Milestone): void {
    this.milestoneSelected.emit(milestone);
  }

  // NUEVO: Abrir modal de eliminación en lugar de confirm()
  onMilestoneDelete(milestone: Milestone): void {
    this.selectedMilestoneForDelete.set(milestone);
    this.showDeleteModal.set(true);
  }

  async confirmDelete(): Promise<void> {
    const milestone = this.selectedMilestoneForDelete();
    if (milestone) {
      await this.milestoneStore.deleteMilestone(milestone.id);
      this.closeDeleteModal();
      await this.loadMilestones();
    }
  }

  closeDeleteModal(): void {
    this.showDeleteModal.set(false);
    this.selectedMilestoneForDelete.set(null);
  }

  // Métodos para reprogramar
  onMilestoneReschedule(milestone: Milestone): void {
    this.selectedMilestoneForReschedule.set(milestone);
    this.showRescheduleModal.set(true);
  }

  closeRescheduleModal(): void {
    this.showRescheduleModal.set(false);
    this.selectedMilestoneForReschedule.set(null);
  }

  async onMilestoneRescheduled(updatedMilestone: Milestone): Promise<void> {
    this.closeRescheduleModal();
    await this.loadMilestones();
  }

  refresh(): void {
    this.loadMilestones();
  }
}
