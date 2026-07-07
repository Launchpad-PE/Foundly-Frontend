import { Component, inject, input, output, signal, OnInit, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MilestoneStore } from '../../../application/milestone-store';
import { ApplicationStatus } from '../../../../applications/domain/enum/application-status.enum';
import { ApplicationStore } from '../../../../applications/application/application.store';
import { TranslatePipe } from '@ngx-translate/core';

interface TaskItem {
  title: string;
  description: string;
  assigneeId: string;
  checklist: Array<{ description: string; done: boolean }>;
  attachments: string[];
}

@Component({
  selector: 'app-create-milestone-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './create-milestone-modal.component.html',
  styleUrls: ['./create-milestone-modal.component.css']
})
export class CreateMilestoneModalComponent implements OnInit {
  private milestoneStore = inject(MilestoneStore);
  private applicationStore = inject(ApplicationStore);

  isOpen = input(false);
  projectId = input.required<string>();
  creatorId = input.required<string>();
  close = output();
  created = output<any>();

  // Form fields
  title = signal('');
  description = signal('');
  dueDate = signal('');
  tools = signal<string[]>([]);
  attachments = signal<string[]>([]);
  generalComment = signal('');

  // Tareas del hito
  tasks = signal<TaskItem[]>([]);

  // Tarea temporal
  currentTask: TaskItem = {
    title: '',
    description: '',
    assigneeId: '',
    checklist: [],
    attachments: []
  };
  currentChecklistItem = '';
  currentAttachment = '';
  showTaskForm = signal(false);
  editingTaskIndex = signal<number | null>(null);

  currentTool = '';
  currentAttachmentUrl = '';

  loading = signal(false);
  collaborators = signal<Array<{ id: string; fullName: string }>>([]);

  // Validaciones individuales
  isTitleValid = computed(() => this.title().trim().length > 0);
  isDescriptionValid = computed(() => this.description().trim().length > 0);
  isDueDateValid = computed(() => !!this.dueDate() && this.dueDate().trim().length > 0);
  isToolsValid = computed(() => this.tools().length > 0);
  isAttachmentsValid = computed(() => this.attachments().length > 0);
  isGeneralCommentValid = computed(() => this.generalComment().trim().length > 0);
  isTasksValid = computed(() => this.tasks().length > 0);

  // Validación de cada tarea individual
  areAllTasksValid = computed(() => {
    if (this.tasks().length === 0) return false;

    // Verificar que cada tarea tenga título y asignación
    return this.tasks().every(task =>
      task.title.trim().length > 0 &&
      task.assigneeId.trim().length > 0
    );
  });

  // Validación completa del formulario - TODOS los campos requeridos
  isFormComplete = computed(() => {
    const titleFilled = this.isTitleValid();
    const descriptionFilled = this.isDescriptionValid();
    const dateFilled = this.isDueDateValid();
    const toolsFilled = this.isToolsValid();
    const attachmentsFilled = this.isAttachmentsValid();
    const generalCommentFilled = this.isGeneralCommentValid();
    const tasksFilled = this.isTasksValid();
    const allTasksValid = this.areAllTasksValid();

    const complete = titleFilled &&
      descriptionFilled &&
      dateFilled &&
      toolsFilled &&
      attachmentsFilled &&
      generalCommentFilled &&
      tasksFilled &&
      allTasksValid;

    // Debug logs detallados
    if (!complete) {
      console.log('❌ Formulario INCOMPLETO:', {
        'Título': titleFilled ? '✅' : '❌',
        'Descripción': descriptionFilled ? '✅' : '❌',
        'Fecha': dateFilled ? '✅' : '❌',
        'Herramientas (mínimo 1)': toolsFilled ? '✅' : '❌',
        'Adjuntos (mínimo 1)': attachmentsFilled ? '✅' : '❌',
        'Comentario General': generalCommentFilled ? '✅' : '❌',
        'Tareas (mínimo 1)': tasksFilled ? '✅' : '❌',
        'Tareas válidas': allTasksValid ? '✅' : '❌'
      });
    } else {
      console.log('✅ Formulario COMPLETO - Botón habilitado');
    }

    return complete;
  });

  minDate = new Date().toISOString().split('T')[0];

  ngOnInit(): void {
    this.loadCollaborators();
  }

  async loadCollaborators(): Promise<void> {
    await this.applicationStore.loadApplicationsByProject(this.projectId());
    const apps = this.applicationStore.projectApplications();
    const accepted = apps.filter(a => a.status === ApplicationStatus.ACCEPTED);
    this.collaborators.set(accepted.map(a => ({
      id: a.userId.toString(),
      fullName: a.fullName.getValue()
    })));
  }

  updateTitle(value: string): void {
    this.title.set(value);
  }

  updateDescription(value: string): void {
    this.description.set(value);
  }

  updateDueDate(value: string): void {
    this.dueDate.set(value);
  }

  addTool(): void {
    const tool = this.currentTool.trim();
    if (tool && !this.tools().includes(tool)) {
      this.tools.update(tools => [...tools, tool]);
      this.currentTool = '';
    }
  }

  removeTool(index: number): void {
    this.tools.update(tools => tools.filter((_, i) => i !== index));
  }

  addAttachment(): void {
    const url = this.currentAttachmentUrl.trim();
    if (url && !this.attachments().includes(url)) {
      this.attachments.update(attachments => [...attachments, url]);
      this.currentAttachmentUrl = '';
    }
  }

  removeAttachment(index: number): void {
    this.attachments.update(attachments => attachments.filter((_, i) => i !== index));
  }

  openTaskForm(): void {
    this.showTaskForm.set(true);
    this.resetCurrentTask();
  }

  closeTaskForm(): void {
    this.showTaskForm.set(false);
    this.editingTaskIndex.set(null);
    this.resetCurrentTask();
  }

  resetCurrentTask(): void {
    this.currentTask = {
      title: '',
      description: '',
      assigneeId: '',
      checklist: [],
      attachments: []
    };
    this.currentChecklistItem = '';
    this.currentAttachment = '';
  }

  addTaskChecklistItem(): void {
    const item = this.currentChecklistItem.trim();
    if (item) {
      this.currentTask.checklist.push({ description: item, done: false });
      this.currentChecklistItem = '';
    }
  }

  removeTaskChecklistItem(index: number): void {
    this.currentTask.checklist.splice(index, 1);
  }

  addTaskAttachment(): void {
    const url = this.currentAttachment.trim();
    if (url && !this.currentTask.attachments.includes(url)) {
      this.currentTask.attachments.push(url);
      this.currentAttachment = '';
    }
  }

  removeTaskAttachment(index: number): void {
    this.currentTask.attachments.splice(index, 1);
  }

  saveTask(): void {
    if (!this.currentTask.title.trim() || !this.currentTask.assigneeId) return;

    if (this.editingTaskIndex() !== null) {
      this.tasks.update(tasks => {
        const updated = [...tasks];
        updated[this.editingTaskIndex()!] = { ...this.currentTask };
        return updated;
      });
    } else {
      this.tasks.update(tasks => [...tasks, { ...this.currentTask }]);
    }

    this.closeTaskForm();
  }

  editTask(index: number): void {
    this.currentTask = { ...this.tasks()[index] };
    this.editingTaskIndex.set(index);
    this.showTaskForm.set(true);
  }

  removeTask(index: number): void {
    this.tasks.update(tasks => tasks.filter((_, i) => i !== index));
  }

  truncateUrl(url: string): string {
    if (url.length <= 40) return url;
    return url.substring(0, 40) + '...';
  }

  getAssigneeName(assigneeId: string): string {
    const assignee = this.collaborators().find(c => c.id === assigneeId);
    return assignee?.fullName || 'Sin asignar';
  }

  async onSubmit(): Promise<void> {
    console.log('Intentando enviar, isFormComplete:', this.isFormComplete());
    if (!this.isFormComplete()) return;

    this.loading.set(true);
    try {
      const milestone = await this.milestoneStore.createMilestone({
        projectId: this.projectId(),
        creatorId: this.creatorId(),
        title: this.title().trim(),
        description: this.description().trim(),
        dueDate: this.dueDate() ? new Date(this.dueDate()) : new Date(),
        tools: this.tools(),
        generalComment: this.generalComment().trim(),
        attachments: this.attachments(),
        tasks: this.tasks().map(task => ({
          title: task.title,
          description: task.description,
          assigneeId: task.assigneeId,
          checklist: task.checklist,
          attachments: task.attachments
        }))
      });

      this.created.emit(milestone);
      this.resetForm();
      this.onClose();
    } catch (error) {
      console.error('Error creating milestone:', error);
    } finally {
      this.loading.set(false);
    }
  }

  resetForm(): void {
    this.title.set('');
    this.description.set('');
    this.dueDate.set('');
    this.tools.set([]);
    this.attachments.set([]);
    this.generalComment.set('');
    this.tasks.set([]);
    this.currentTool = '';
    this.currentAttachmentUrl = '';
    this.showTaskForm.set(false);
    this.editingTaskIndex.set(null);
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
