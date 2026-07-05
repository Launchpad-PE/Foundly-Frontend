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
import { UserStore } from '../../../../iam/application/user.store';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-task-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './task-detail.html',
  styleUrls: ['./task-detail.css']
})
export class TaskDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private taskStore = inject(TaskStore);
  private projectStore = inject(ProjectStore);
  private applicationApi = inject(ApplicationApi);
  private userStore = inject(UserStore);

  task = signal<Task | null>(null);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);
  projectName = signal<string>('');
  collaboratorName = signal<string>('');

  private deliverMode = signal<boolean>(false);
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

  // ✅ CORREGIDO: El usuario puede ver la tarea si el backend la devolvió
  readonly canView = computed<boolean>(() => {
    const task = this.task();
    if (!task) return false;

    // ✅ Si el backend devolvió la tarea, significa que el usuario tiene permisos
    console.log('🔍 [FRONTEND] canView - task existe, permitiendo vista');
    return true;
  });

  // ✅ CORREGIDO: Solo puede entregar si es el asignado y la tarea no está completada
  readonly canDeliver = computed<boolean>(() => {
    const task = this.task();
    const currentUser = this.userStore.currentUser();
    if (!task || !currentUser) return false;

    const isAssignee = String(task.assigneeId) === String(currentUser.id);
    const isPending = !this.isCompleted();
    const isDeliverMode = this.deliverMode();

    console.log('🔍 [FRONTEND] canDeliver - isAssignee:', isAssignee);
    console.log('🔍 [FRONTEND] canDeliver - isPending:', isPending);
    console.log('🔍 [FRONTEND] canDeliver - isDeliverMode:', isDeliverMode);

    return isAssignee && isPending && isDeliverMode;
  });

  readonly collaboratorInitials = computed<string>(() => {
    const name = this.collaboratorName();
    if (!name) return '?';
    return name.split(' ').filter(p => p.length > 0).slice(0, 2)
      .map(p => p[0].toUpperCase()).join('');
  });

  // ─── Delivery ──────────────────────────────────────────────────────

  deliveryUrl: string = '';
  deliveryNotes: string = '';
  deliveryComment: string = '';
  delivering = signal<boolean>(false);
  deliverError = signal<string>('');

  // ─── Lifecycle ────────────────────────────────────────────────────

  async ngOnInit(): Promise<void> {
    const projectId = this.route.snapshot.paramMap.get('id');
    const taskId    = this.route.snapshot.paramMap.get('taskId');

    console.log('🔍 [FRONTEND] ngOnInit - projectId:', projectId);
    console.log('🔍 [FRONTEND] ngOnInit - taskId:', taskId);

    if (!projectId || !taskId) {
      this.router.navigate(['/projects']);
      return;
    }
    this.projectId = projectId;
    this.deliverMode.set(this.route.snapshot.queryParamMap.get('accion') === 'entregar');

    try {
      // Cargar la tarea y el proyecto en paralelo
      const [task, project] = await Promise.all([
        this.taskStore.loadTask(taskId),
        this.projectStore.loadProject(projectId)
      ]);

      console.log('🔍 [FRONTEND] Task cargada:', task);
      console.log('🔍 [FRONTEND] Project cargado:', project);

      this.task.set(task);
      this.projectName.set(project?.name.getValue() ?? '');

      if (task) {
        // Obtener nombre del colaborador
        try {
          const apps = await firstValueFrom(
            this.applicationApi.getApplicationsByProjectAndUser(projectId, task.assigneeId.toString())
          );
          if (apps.length > 0) {
            this.collaboratorName.set(apps[0].fullName.getValue());
          }
        } catch (err) {
          console.warn('No se pudo obtener el nombre del colaborador:', err);
        }
      }

      this.loading.set(false);
    } catch (err: any) {
      console.error('❌ [FRONTEND] Error cargando tarea:', err);
      if (err?.status === 403) {
        this.error.set('No tienes permisos para ver esta tarea.');
      } else if (err?.status === 404) {
        this.error.set('No se encontró la tarea.');
      } else {
        this.error.set(err?.message || 'Error al cargar la tarea.');
      }
      this.loading.set(false);
    }
  }

  // ─── Actions ──────────────────────────────────────────────────────

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

      // ✅ Recargar la tarea para obtener el estado actualizado
      const updatedTask = await this.taskStore.loadTask(task.id);
      this.task.set(updatedTask);

      console.log('✅ [FRONTEND] Tarea entregada correctamente');
    } catch (err: any) {
      console.error('❌ [FRONTEND] Error entregando tarea:', err);
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
