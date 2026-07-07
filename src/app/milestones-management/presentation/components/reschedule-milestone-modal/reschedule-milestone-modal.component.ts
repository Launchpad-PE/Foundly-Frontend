import { Component, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MilestoneStore } from '../../../application/milestone-store';
import { Milestone } from '../../../domain/entities/milestone.entity';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-reschedule-milestone-modal',
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './reschedule-milestone-modal.component.html',
  styleUrl: './reschedule-milestone-modal.component.css',
})
export class RescheduleMilestoneModalComponent {
  private milestoneStore = inject(MilestoneStore);

  isOpen = input(false);
  milestone = input.required<Milestone>();
  close = output();
  rescheduled = output<Milestone>();

  newDueDate = '';
  minDate = new Date().toISOString().split('T')[0];

  onClose(): void {
    this.close.emit();
  }

  async saveNewDueDate(): Promise<void> {
    if (!this.newDueDate) return;

    const updated = await this.milestoneStore.updateMilestone(this.milestone().id, {
      dueDate: new Date(this.newDueDate)
    });

    this.rescheduled.emit(updated);
    this.onClose();
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.onClose();
    }
  }
}
