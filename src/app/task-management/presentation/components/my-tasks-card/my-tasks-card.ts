import { Component, Input, OnInit, OnChanges, SimpleChanges, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { TaskApi } from '../../../infrastructure/task-api';
import { Task } from '../../../domain/entities/task.entity';

@Component({
  selector: 'app-my-tasks-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-tasks-card.html',
  styleUrls: ['./my-tasks-card.css']
})
export class MyTasksCardComponent implements OnInit, OnChanges {
  @Input() projectId: string = '';
  @Input() assigneeId: string = '';
  @Input() maxItems: number = 4;

  private taskApi = inject(TaskApi);
  private router = inject(Router);

  tasks = signal<Task[]>([]);
  loading = signal<boolean>(true);
  errorMessage = signal<string>('');

  ngOnInit(): void {
    this.load();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['projectId'] || changes['assigneeId']) {
      this.load();
    }
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
      this.tasks.set(sorted.slice(0, this.maxItems));
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
}
