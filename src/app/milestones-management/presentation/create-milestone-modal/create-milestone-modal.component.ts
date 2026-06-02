import { Component, computed, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MilestoneStore } from '../../application/MilestoneStore';

@Component({
  selector: 'app-create-milestone-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-milestone-modal.component.html',
  styleUrls: ['./create-milestone-modal.component.css']
})
export class CreateMilestoneModalComponent {
  private milestoneStore = inject(MilestoneStore);

  isOpen = input(false);
  projectId = input.required<string>();
  creatorId = input.required<string>();
  close = output();
  created = output<any>();

  // Form fields
  title = '';
  description = '';
  dueDate = '';
  tools: string[] = [];
  attachments: string[] = [];
  generalComment = '';

  // Temporary inputs
  currentTool = '';
  currentAttachment = '';

  loading = signal(false);

  // Fecha mínima = hoy (para no permitir fechas pasadas)
  minDate = new Date().toISOString().split('T')[0];

  // Validations
  isTitleValid = computed(() => this.title.trim().length >= 3 && this.title.trim().length <= 120);
  isDescriptionValid = computed(
    () => this.description.trim().length >= 5 && this.description.trim().length <= 2000,
  );
  isDueDateValid = computed(() => !!this.dueDate);

  isValid = computed(
    () => this.isTitleValid() && this.isDescriptionValid() && this.isDueDateValid(),
  );

  titleError = computed(() => {
    if (!this.title) return '';
    const len = this.title.trim().length;
    if (len < 3) return 'Mínimo 3 caracteres';
    if (len > 120) return 'Máximo 120 caracteres';
    return '';
  });

  descriptionError = computed(() => {
    if (!this.description) return '';
    const len = this.description.trim().length;
    if (len < 5) return 'Mínimo 5 caracteres';
    if (len > 2000) return 'Máximo 2000 caracteres';
    return '';
  });

  addTool(): void {
    const tool = this.currentTool.trim();
    if (tool && !this.tools.includes(tool)) {
      this.tools.push(tool);
      this.currentTool = '';
    }
  }

  removeTool(index: number): void {
    this.tools.splice(index, 1);
  }

  addAttachment(): void {
    const url = this.currentAttachment.trim();
    if (url && this.isValidUrl(url) && !this.attachments.includes(url)) {
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

  truncateUrl(url: string): string {
    if (url.length <= 40) return url;
    return url.substring(0, 40) + '...';
  }

  async onSubmit(): Promise<void> {
    if (!this.isValid()) return;

    this.loading.set(true);
    try {
      const milestone = await this.milestoneStore.createMilestone({
        projectId: this.projectId(),
        creatorId: this.creatorId(),
        title: this.title.trim(),
        description: this.description.trim(),
        dueDate: new Date(this.dueDate),
        tools: this.tools.length > 0 ? this.tools : undefined,
        generalComment: this.generalComment.trim() || undefined,
        attachments: this.attachments.length > 0 ? this.attachments : undefined,
      });

      this.created.emit(milestone);
      this.resetForm();
    } catch (error) {
      console.error('Error creating milestone:', error);
    } finally {
      this.loading.set(false);
    }
  }

  resetForm(): void {
    this.title = '';
    this.description = '';
    this.dueDate = '';
    this.tools = [];
    this.attachments = [];
    this.generalComment = '';
    this.currentTool = '';
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
