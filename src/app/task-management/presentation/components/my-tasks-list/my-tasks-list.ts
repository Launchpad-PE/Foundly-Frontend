import { Component, Input, OnInit, OnChanges, SimpleChanges, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { TaskApi } from '../../../infrastructure/task-api';
import { TaskStore } from '../../../application/task.store';
import { Task } from '../../../domain/entities/task.entity';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-my-tasks-list',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './my-tasks-list.html',
  styleUrls: ['./my-tasks-list.css']
})
export class MyTasksListComponent implements OnInit, OnChanges {
  @Input() projectId: string = '';
  @Input() assigneeId: string = '';

  private taskApi = inject(TaskApi);
  private taskStore = inject(TaskStore);
  private router = inject(Router);

  tasks = signal<Task[]>([]);
  loading = signal<boolean>(true);
  errorMessage = signal<string>('');

  readonly totalCount = computed(() => this.tasks().length);
  readonly completedCount = computed(() =>
    this.tasks().filter(t => t.isCompleted()).length
  );

  ngOnInit(): void { this.load(); }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['projectId'] || changes['assigneeId']) this.load();
  }

  private async load(): Promise<void> {
    if (!this.projectId || !this.assigneeId) {
      this.loading.set(false);
      return;
    }
    this.loading.set(true);
    this.errorMessage.set('');
    try {
      const all = await firstValueFrom(
        this.taskApi.getTasksByProjectAndAssignee(this.projectId, this.assigneeId)
      );
      const sorted = [...all].sort((a, b) => {
        if (a.isCompleted() !== b.isCompleted()) return a.isCompleted() ? 1 : -1;
        return a.dueDate.getTime() - b.dueDate.getTime();
      });
      this.tasks.set(sorted);
    } catch (err: any) {
      this.errorMessage.set(err?.message ?? 'Error al cargar tus tareas');
    } finally {
      this.loading.set(false);
    }
  }

  formatDate(d: Date): string {
    const x = new Date(d);
    const day = String(x.getUTCDate()).padStart(2, '0');
    const month = String(x.getUTCMonth() + 1).padStart(2, '0');
    const year = x.getUTCFullYear();
    return `${day}/${month}/${year}`;
  }

  viewTask(task: Task): void {
    this.router.navigate(['/projects', this.projectId, 'tasks', task.id]);
  }

  doTask(task: Task): void {
    this.router.navigate(['/projects', this.projectId, 'tasks', task.id]);
  }
}
