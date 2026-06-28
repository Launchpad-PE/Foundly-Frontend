import { Component, input, output, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MilestoneStore } from '../../../application/milestone-store';
import { MilestoneTask } from '../../../domain/entities/milestone-task.entity';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-create-task-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './create-task-modal.component.html',
  styleUrls: ['./create-task-modal.component.css']
})
export class CreateTaskModalComponent implements OnInit {
  private milestoneStore = inject(MilestoneStore);

  isOpen = input(false);
  milestoneId = input.required<string>();
  assignees = input.required<Array<{ id: string; fullName: string }>>();
  taskToEdit = input<MilestoneTask | null>(null);
  close = output();
  saved = output();

  // Form fields
  title = '';
  description = '';
  assigneeId = '';
  checklistItems: Array<{ description: string; done: boolean }> = [];
  attachments: string[] = [];

  // Temporary inputs
  currentChecklistItem = '';
  currentAttachment = '';

  loading = signal(false);

  // Computed
  isEditMode = computed(() => !!this.taskToEdit());

  isTitleValid = computed(() => this.title.trim().length >= 1);
  isDescriptionValid = computed(() => this.description.trim().length >= 5);
  isAssigneeValid = computed(() => !!this.assigneeId);

  isValid = computed(() =>
    this.isTitleValid() &&
    this.isDescriptionValid() &&
    this.isAssigneeValid()
  );

  ngOnInit(): void {
    if (this.taskToEdit()) {
      this.loadTaskData();
    }
  }

  loadTaskData(): void {
    const task = this.taskToEdit();
    if (task) {
      this.title = task.title;
      this.description = task.description.getValue();
      this.assigneeId = task.assigneeId.toString();
      this.checklistItems = task.checklist.map(step => ({
        description: step.getDescription(),
        done: step.isDone()
      }));
      this.attachments = task.attachments.map(att => att.getValue());
    }
  }

  addChecklistItem(): void {
    const item = this.currentChecklistItem.trim();
    if (item) {
      this.checklistItems.push({ description: item, done: false });
      this.currentChecklistItem = '';
    }
  }

  removeChecklistItem(index: number): void {
    this.checklistItems.splice(index, 1);
  }

  addAttachment(): void {
    const url = this.currentAttachment.trim();
    if (url && this.isValidUrl(url)) {
      this.attachments.push(url);
      this.currentAttachment = '';
    }
  }

  removeAttachment(index: number): void {
    this.attachments.splice(index, 1);
  }

  isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  getShortUrl(url: string): string {
    if (url.length <= 40) return url;
    return url.substring(0, 40) + '...';
  }

  async onSubmit(): Promise<void> {
    if (!this.isValid()) return;

    this.loading.set(true);
    try {
      if (this.isEditMode() && this.taskToEdit()) {
        // Actualizar tarea existente
        // Nota: Necesitarías un método updateTask en el store
        // Por ahora, creamos una nueva y eliminamos la vieja
        await this.milestoneStore.deleteTask(this.taskToEdit()!.id);
        await this.milestoneStore.addTaskToMilestone(this.milestoneId(), {
          title: this.title.trim(),
          description: this.description.trim(),
          assigneeId: this.assigneeId,
          checklist: this.checklistItems,
          attachments: this.attachments
        });
      } else {
        // Crear nueva tarea
        await this.milestoneStore.addTaskToMilestone(this.milestoneId(), {
          title: this.title.trim(),
          description: this.description.trim(),
          assigneeId: this.assigneeId,
          checklist: this.checklistItems,
          attachments: this.attachments
        });
      }

      this.saved.emit();
      this.resetForm();
    } catch (error) {
      console.error('Error saving task:', error);
    } finally {
      this.loading.set(false);
    }
  }

  resetForm(): void {
    this.title = '';
    this.description = '';
    this.assigneeId = '';
    this.checklistItems = [];
    this.attachments = [];
    this.currentChecklistItem = '';
    this.currentAttachment = '';
  }

  onClose(): void {
    this.resetForm();
    this.close.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.onClose();
    }
  }
}
