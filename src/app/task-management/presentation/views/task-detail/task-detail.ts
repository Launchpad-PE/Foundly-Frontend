import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { TaskStore } from '../../../application/task.store';
import { Task } from '../../../domain/entities/task.entity';
import { TaskStatus } from '../../../domain/enum/task-status.enum';
import { ProjectStore } from '../../../../project-management/application/project-store';
import { ApplicationApi } from '../../../../applications/infrastructure/application-api';

@Component({
  selector: 'app-task-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './task-detail.html',
  styleUrls: ['./task-detail.css']
})
export class TaskDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private taskStore = inject(TaskStore);
  private projectStore = inject(ProjectStore);
  private applicationApi = inject(ApplicationApi);

  task = signal<Task | null>(null);
  loading = signal<boolean>(true);
  projectName = signal<string>('');
  collaboratorName = signal<string>('');

  private projectId: string = '';

  readonly displayStatus = computed<TaskStatus>(() => {
    const t = this.task();
    return t ? t.getDisplayStatus() : TaskStatus.PENDING;
  });

  readonly statusLabel = computed<string>(() => {
    switch (this.displayStatus()) {
      case TaskStatus.COMPLETED: return 'Completado';
      case TaskStatus.DELAYED:   return 'Retrasado';
      default:                   return 'Pendiente';
    }
  });

  readonly isCompleted = computed<boolean>(() => {
    return this.task()?.isCompleted() ?? false;
  });

  readonly collaboratorInitials = computed<string>(() => {
    const name = this.collaboratorName();
    if (!name) return '?';
    return name.split(' ').filter(p => p.length > 0).slice(0, 2)
      .map(p => p[0].toUpperCase()).join('');
  });

  async ngOnInit(): Promise<void> {
    const projectId = this.route.snapshot.paramMap.get('id');
    const taskId    = this.route.snapshot.paramMap.get('taskId');

    if (!projectId || !taskId) {
      this.router.navigate(['/projects']);
      return;
    }
    this.projectId = projectId;

    const [task, project] = await Promise.all([
      this.taskStore.loadTask(taskId),
      this.projectStore.loadProject(projectId)
    ]);

    this.task.set(task);
    this.projectName.set(project?.name.getValue() ?? '');

    if (task) {
      try {
        const apps = await firstValueFrom(
          this.applicationApi.getApplicationsByProjectAndUser(projectId, task.assigneeId.toString())
        );
        if (apps.length > 0) {
          this.collaboratorName.set(apps[0].fullName.getValue());
        }
      } catch {
        // Si falla, no romper
      }
    }

    this.loading.set(false);
  }

  deliveryUrl: string = '';
  deliveryNotes: string = '';
  deliveryComment: string = '';
  delivering = signal<boolean>(false);
  deliverError = signal<string>('');

  async submitDelivery(): Promise<void> {
    if (!this.deliveryUrl.trim()) {
      this.deliverError.set('El enlace de entrega es obligatorio.');
      return;
    }
    const task = this.task();
    if (!task) return;
    this.delivering.set(true);
    this.deliverError.set('');
    try {
      await this.taskStore.completeTask(task.id, this.deliveryUrl.trim(), this.deliveryNotes.trim() || null);
      const updated = await this.taskStore.loadTask(task.id);
      this.task.set(updated);
    } catch (err: any) {
      this.deliverError.set(err?.message ?? 'Error al entregar la tarea.');
    } finally {
      this.delivering.set(false);
    }
  }

  goBack(): void {
    this.router.navigate(['/projects', this.projectId]);
  }

  formatDate(d: Date): string {
    const x = new Date(d);
    const day = String(x.getUTCDate()).padStart(2, '0');
    const month = String(x.getUTCMonth() + 1).padStart(2, '0');
    const year = x.getUTCFullYear();
    return `${day}/${month}/${year}`;
  }
}
