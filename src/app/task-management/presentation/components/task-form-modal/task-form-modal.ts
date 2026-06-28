import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';

import { AssigneeOption } from '../task-list/task-list';

export interface TaskFormSubmit {
  assigneeId: string;
  title: string;
  description: string;
  dueDate: string;
  checklist: Array<{ description: string; done?: boolean }>;
  attachments: string[];
  tools: string[];
  comment: string | null;
}

@Component({
  selector: 'app-task-form-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './task-form-modal.html',
  styleUrls: ['./task-form-modal.css']
})
export class TaskFormModalComponent {
  @Input() assignees: AssigneeOption[] = [];
  @Output() close = new EventEmitter<void>();
  @Output() submitTask = new EventEmitter<TaskFormSubmit>();

  assigneeId = signal<string>('');
  title = signal<string>('');
  dueDate = signal<string>('');
  description = signal<string>('');

  checklist = signal<string[]>([]);
  newStep = signal<string>('');

  attachments = signal<string[]>([]);
  newLink = signal<string>('');
  showLinkInput = signal<boolean>(false);

  tools = signal<string[]>([]);
  newTool = signal<string>('');

  comment = signal<string>('');
  errorMessage = signal<string>('');
  submitting = signal<boolean>(false);

  addStep(): void {
    const v = this.newStep().trim();
    if (v.length === 0) return;
    this.checklist.update(list => [...list, v]);
    this.newStep.set('');
  }

  removeStep(i: number): void {
    this.checklist.update(list => list.filter((_, idx) => idx !== i));
  }

  openLinkInput(): void { this.showLinkInput.set(true); }

  cancelLink(): void { this.showLinkInput.set(false); this.newLink.set(''); }

  addLink(): void {
    const v = this.newLink().trim();
    if (v.length === 0) return;
    try {
      const u = new URL(v);
      if (u.protocol !== 'http:' && u.protocol !== 'https:') throw new Error();
    } catch {
      this.errorMessage.set('El enlace debe ser una URL válida (http/https).');
      return;
    }
    this.attachments.update(list => [...list, v]);
    this.newLink.set('');
    this.showLinkInput.set(false);
    this.errorMessage.set('');
  }

  removeLink(i: number): void {
    this.attachments.update(list => list.filter((_, idx) => idx !== i));
  }

  addTool(): void {
    const v = this.newTool().trim();
    if (v.length === 0) return;
    this.tools.update(list => [...list, v]);
    this.newTool.set('');
  }

  removeTool(i: number): void {
    this.tools.update(list => list.filter((_, idx) => idx !== i));
  }

  onBackdropClick(ev: MouseEvent): void {
    if ((ev.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.close.emit();
    }
  }

  onCancel(): void { this.close.emit(); }

  private validate(): string | null {
    if (!this.assigneeId()) return 'Selecciona un colaborador.';
    if (this.title().trim().length < 3) return 'El título debe tener al menos 3 caracteres.';
    if (this.description().trim().length < 5) return 'La descripción debe tener al menos 5 caracteres.';
    if (!this.dueDate()) return 'Selecciona la fecha de entrega.';
    const due = new Date(this.dueDate());
    if (isNaN(due.getTime())) return 'Fecha de entrega inválida.';
    return null;
  }

  onSubmit(): void {
    this.errorMessage.set('');
    const v = this.validate();
    if (v) {
      this.errorMessage.set(v);
      return;
    }

    this.submitting.set(true);

    const [year, month, day] = this.dueDate().split('-').map(Number);
    const utcDate = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));

    this.submitTask.emit({
      assigneeId: this.assigneeId(),
      title: this.title().trim(),
      description: this.description().trim(),
      dueDate: utcDate.toISOString(),
      checklist: this.checklist().map(d => ({ description: d, done: false })),
      attachments: this.attachments(),
      tools: this.tools(),
      comment: this.comment().trim() || null
    });
  }
}
