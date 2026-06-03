import { Component, input, output } from '@angular/core';
import { Milestone } from '../../../domain/entities/milestone.entity';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-delete-milestone-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './delete-milestone-modal.component.html',
  styleUrl: './delete-milestone-modal.component.css',
})
export class DeleteMilestoneModalComponent {
  isOpen = input(false);
  milestone = input.required<Milestone>();
  close = output();
  confirmed = output();

  onClose(): void {
    this.close.emit();
  }

  onConfirm(): void {
    this.confirmed.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.onClose();
    }
  }
}
