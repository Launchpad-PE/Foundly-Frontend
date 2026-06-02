import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MilestoneStore } from '../../../application/milestone-store';
import { MilestoneTask } from '../../../domain/entities/milestone-task.entity';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-deliver-task',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './deliver-task.component.html',
  styleUrl: './deliver-task.component.css',
})
export class DeliverTaskComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private milestoneStore = inject(MilestoneStore);

  projectId = '';
  milestoneId = '';
  taskId = '';

  task = signal<MilestoneTask | null>(null);
  loading = signal(true);
  submitting = signal(false);

  // Form fields
  deliveryUrl = '';
  deliveryNotes = '';

  error = signal<string | null>(null);

  ngOnInit(): void {
    this.projectId = this.route.snapshot.paramMap.get('id') || '';
    this.milestoneId = this.route.snapshot.paramMap.get('milestoneId') || '';
    this.taskId = this.route.snapshot.paramMap.get('taskId') || '';

    this.loadTask();
  }

  async loadTask(): Promise<void> {
    this.loading.set(true);
    try {
      const milestone = await this.milestoneStore.loadMilestone(this.milestoneId);
      if (milestone) {
        const task = milestone.tasks.find(t => t.id === this.taskId);
        this.task.set(task || null);
      }
    } catch (err) {
      console.error('Error loading task:', err);
      this.error.set('Error al cargar la tarea');
    } finally {
      this.loading.set(false);
    }
  }

  getCompletedChecklistCount(): number {
    const task = this.task();
    if (!task) return 0;
    return task.checklist.filter(step => step.isDone()).length;
  }

  getTotalChecklistCount(): number {
    const task = this.task();
    if (!task) return 0;
    return task.checklist.length;
  }

  isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  isFormValid(): boolean {
    return this.deliveryUrl.trim().length > 0 && this.isValidUrl(this.deliveryUrl);
  }

  async submitDelivery(): Promise<void> {
    if (!this.isFormValid()) return;

    this.submitting.set(true);
    this.error.set(null);

    try {
      // Usar updateTaskStatus en lugar de completeTaskWithDelivery
      await this.milestoneStore.updateTaskStatus(this.taskId, true);

      // Recargar los datos
      await this.milestoneStore.loadMilestonesByProject(this.projectId);
      await this.milestoneStore.loadMilestone(this.milestoneId);

      this.router.navigate([`/projects/${this.projectId}/participating`], {
        queryParams: { tab: 'tareas' }
      });
    } catch (err: any) {
      console.error('Error delivering task:', err);
      this.error.set(err?.message || 'Error al entregar la tarea');
    } finally {
      this.submitting.set(false);
    }
  }
  goBack(): void {
    this.router.navigate([`/projects/${this.projectId}/participating`], {
      queryParams: { tab: 'tareas' }
    });
  }

  truncateUrl(url: string): string {
    if (!url) return '';
    if (url.length <= 40) return url;
    return url.substring(0, 40) + '...';
  }
}
