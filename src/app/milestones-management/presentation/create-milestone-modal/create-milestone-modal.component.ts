import { Component, inject, input, output, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MilestoneStore } from '../../application/MilestoneStore';
import { ApplicationStatus } from '../../../applications/domain/enum/application-status.enum';
import { ApplicationStore } from '../../../applications/application/application.store';

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
  imports: [CommonModule, FormsModule],
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
  title = '';
  description = '';
  dueDate = '';
  tools: string[] = [];
  attachments: string[] = [];
  generalComment = '';

  // Tareas del hito
  tasks: TaskItem[] = [];

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

  // Sin validaciones - siempre true
  isValid = true;

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
    const url = this.currentAttachmentUrl.trim();
    if (url && !this.attachments.includes(url)) {
      this.attachments.push(url);
      this.currentAttachmentUrl = '';
    }
  }

  removeAttachment(index: number): void {
    this.attachments.splice(index, 1);
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
      this.tasks[this.editingTaskIndex()!] = { ...this.currentTask };
    } else {
      this.tasks.push({ ...this.currentTask });
    }

    this.closeTaskForm();
  }

  editTask(index: number): void {
    this.currentTask = { ...this.tasks[index] };
    this.editingTaskIndex.set(index);
    this.showTaskForm.set(true);
  }

  removeTask(index: number): void {
    this.tasks.splice(index, 1);
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
    this.loading.set(true);
    try {
      const milestone = await this.milestoneStore.createMilestone({
        projectId: this.projectId(),
        creatorId: this.creatorId(),
        title: this.title.trim(),
        description: this.description.trim(),
        dueDate: this.dueDate ? new Date(this.dueDate) : new Date(),
        tools: this.tools.length > 0 ? this.tools : undefined,
        generalComment: this.generalComment.trim() || undefined,
        attachments: this.attachments.length > 0 ? this.attachments : undefined,
        tasks: this.tasks.map(task => ({
          title: task.title,
          description: task.description,
          assigneeId: task.assigneeId,
          checklist: task.checklist,
          attachments: task.attachments
        }))
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
    this.tasks = [];
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
