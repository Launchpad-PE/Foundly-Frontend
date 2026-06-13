import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProjectStore } from '../../../application/project-store';
import { Project } from '../../../domain/entities/project.entity';
import { EnvironmentalMetric } from '../../../domain/value-objects/environmental-impact.vo';
import { IotDashboardComponent } from '../../../../environmental-monitoring/presentation/views/iot-dashboard/iot-dashboard.component';
import { PostulantListComponent } from '../../../../applications/presentation/components/postulant-list/postulant-list';
import { TaskListComponent, AssigneeOption } from '../../../../task-management/presentation/components/task-list/task-list';
import { ApplicationStore } from '../../../../applications/application/application.store';
import { ApplicationStatus } from '../../../../applications/domain/enum/application-status.enum';
import { TaskStore } from '../../../../task-management/application/task.store';
import {
  MilestoneListComponent
} from '../../../../milestones-management/presentation/components/milestone-list/milestone-list.component';
import {
  MilestoneDetailComponent
} from '../../../../milestones-management/presentation/components/milestone-detail/milestone-detail.component';
import { UserStore } from '../../../../iam/application/user.store';
import { Milestone } from '../../../../milestones-management/domain/entities/milestone.entity';
import { MilestoneStore } from '../../../../milestones-management/application/milestone-store';

type Tab = 'inicio' | 'tareas' | 'iot' | 'hitos' | 'postulantes';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    IotDashboardComponent,
    PostulantListComponent,
    TaskListComponent,
    MilestoneListComponent,
    MilestoneDetailComponent
  ],
  templateUrl: './project-detail.html',
  styleUrls: ['./project-detail.css']
})
export class ProjectDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private projectStore = inject(ProjectStore);
  private applicationStore = inject(ApplicationStore);
  readonly taskStore = inject(TaskStore);
  private userStore = inject(UserStore);
  private milestoneStore = inject(MilestoneStore);

  project = signal<Project | null>(null);
  activeTab = signal<Tab>('inicio');
  loading = signal(true);
  selectedMilestoneId = signal<string | null>(null);

// Agregar signals para milestones
  readonly projectMilestones = this.milestoneStore.projectMilestones;
  readonly loadingMilestones = this.milestoneStore.loading;

  // ── Computed helpers ───────────────────────────────────
  get projectName(): string {
    return this.project()?.name.getValue() ?? '';
  }

  get hasIot(): boolean {
    const metrics = this.project()?.environmentalImpact?.getMetrics() ?? [];
    console.log('🔍 [DETAIL] hasIot check - metrics:', metrics, 'length:', metrics.length);
    return metrics.length > 0;
  }

  get iotMetrics(): EnvironmentalMetric[] {
    const metrics = this.project()?.environmentalImpact?.getMetrics() ?? [];
    console.log('🔍 [DETAIL] iotMetrics:', metrics);
    return metrics;
  }

  get projectId(): string {
    const id = this.project()?.id ?? '';
    console.log('🔍 [DETAIL] projectId (UUID):', id);
    return id;
  }

  get projectRoleNames(): string[] {
    return this.project()?.roles.map(r => r.name.getValue()) ?? [];
  }

  get currentUserId(): string {
    return this.userStore.currentUser()?.id ?? '';
  }

  /** Colaboradores aceptados — alimentan dropdowns de tareas y hitos */
  get taskAssignees(): AssigneeOption[] {
    const apps = this.applicationStore.projectApplications();
    return apps
      .filter(a => a.status === ApplicationStatus.ACCEPTED)
      .map(a => ({ id: a.userId.toString(), fullName: a.fullName.getValue() }));
  }

  readonly acceptedCollaborators = computed(() =>
    this.applicationStore.projectApplications()
      .filter(a => a.status === ApplicationStatus.ACCEPTED)
      .map(a => ({
        userId: a.userId.toString(),
        fullName: a.fullName.getValue(),
        roleId: a.roleId,
        initials: a.fullName.getValue()
          .split(' ').filter((p: string) => p.length > 0).slice(0, 2)
          .map((p: string) => p[0].toUpperCase()).join('')
      }))
  );

  readonly totalTasks = computed(() => this.taskStore.projectTasks().length);
  readonly completedTasksCount = computed(() =>
    this.taskStore.projectTasks().filter(t => t.isCompleted()).length
  );
  readonly urgentTasksCount = computed(() =>
    this.taskStore.projectTasks().filter(t => t.isDelayed()).length
  );
  readonly tasksCompletionPct = computed(() => {
    const total = this.totalTasks();
    if (total === 0) return 0;
    return Math.round((this.completedTasksCount() / total) * 100);
  });
  readonly tasksRingStyle = computed(() => {
    const pct = this.tasksCompletionPct();
    return `conic-gradient(#667eea ${pct}%, #edeef8 ${pct}%)`;
  });

  readonly urgentTasksList = computed(() => {
    const now = new Date();
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(now.getDate() + 3);

    return this.taskStore.projectTasks().filter(t => {
      // Tareas atrasadas
      if (t.isDelayed()) return true;
      // Tareas pendientes que vencen en los próximos 3 días
      if (!t.isCompleted() && t.dueDate <= threeDaysFromNow) return true;
      return false;
    });
  });
  // Computed para hitos del proyecto
  readonly totalMilestones = computed(() => this.projectMilestones().length);
  readonly completedMilestonesCount = computed(() =>
    this.projectMilestones().filter(m => m.isCompleted).length
  );
  readonly milestonesCompletionPct = computed(() => {
    const total = this.totalMilestones();
    if (total === 0) return 0;
    return Math.round((this.completedMilestonesCount() / total) * 100);
  });


  // Próximos hitos (fecha futura, no completados)
  readonly upcomingMilestones = computed(() => {
    const now = new Date();
    return this.projectMilestones()
      .filter(m => !m.isCompleted && new Date(m.dueDate) >= now)
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 3); // Solo los próximos 3
  });

  // ── Lifecycle ──────────────────────────────────────────
  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/projects']);
      return;
    }

    const p = await this.projectStore.loadProject(id);
    console.log('🔍 [DETAIL] Proyecto cargado:', p);
    console.log('🔍 [DETAIL] environmentalImpact:', p?.environmentalImpact);
    console.log('🔍 [DETAIL] hasIot:', this.hasIot);
    console.log('🔍 [DETAIL] iotMetrics:', this.iotMetrics);

    this.project.set(p);

    if (p) {
      this.applicationStore.loadApplicationsByProject(p.id);
      this.taskStore.loadTasksByProject(p.id);
      await this.milestoneStore.loadMilestonesByProject(p.id);
    }
    this.loading.set(false);
  }


  setTab(tab: Tab): void {
    console.log('🔍 [DETAIL] Cambiando a tab:', tab);
    this.activeTab.set(tab);

    // Recargar datos cuando se vuelve a la pestaña Inicio
    if (tab === 'inicio' && this.projectId) {
      this.refreshProjectData();
    }

    // 👈 FORZAR RECARGA CUANDO SE ACTIVA IOT
    if (tab === 'iot' && this.projectId) {
      console.log('🔍 [DETAIL] Tab IoT activada, forzando refresh');
      setTimeout(() => {
        const iotElement = document.querySelector('app-iot-dashboard');
        if (iotElement && (iotElement as any).refresh) {
          console.log('🔍 [DETAIL] Llamando a refresh del componente IoT');
          (iotElement as any).refresh();
        } else {
          console.warn('🔍 [DETAIL] Componente IoT no encontrado o no tiene método refresh');
        }
      }, 100);
    }

    if (tab !== 'hitos') {
      this.selectedMilestoneId.set(null);
    }
  }

  async onMilestoneCreated(milestone: Milestone): Promise<void> {
    // Si estamos en la pestaña hitos, refrescar en segundo plano
    if (this.activeTab() === 'hitos') {
      await this.milestoneStore.loadMilestonesByProject(this.projectId);
    }
  }

  async refreshProjectData(): Promise<void> {
    if (this.projectId) {
      // Recargar aplicaciones (colaboradores)
      await this.applicationStore.loadApplicationsByProject(this.projectId);
      // Recargar tareas
      await this.taskStore.loadTasksByProject(this.projectId);
      // Recargar hitos
      await this.milestoneStore.loadMilestonesByProject(this.projectId);
    }
  }

  goBack(): void {
    this.router.navigate(['/projects']);
  }

  // ── Milestone handlers ─────────────────────────────────
  onMilestoneSelected(milestone: Milestone): void {
    this.selectedMilestoneId.set(milestone.id);
  }

  closeMilestoneDetail(): void {
    this.selectedMilestoneId.set(null);
  }

  onMilestoneUpdated(milestone: Milestone): void {
    console.log('Milestone updated:', milestone);
  }

  // ── Helpers ────────────────────────────────────────────
  formatDate(d: Date): string {
    if (!d) return '-';
    const x = new Date(d);
    const dd = String(x.getDate()).padStart(2, '0');
    const mm = String(x.getMonth() + 1).padStart(2, '0');
    return `${dd}/${mm}/${x.getFullYear()}`;
  }

  getCompletedTasksCount(tasks: any[]): number {
    return tasks.filter(task => task.isCompleted).length;
  }

  readonly overallCompletionPct = computed(() => {
    const tasksWeight = 0.6;  // 60% importancia a tareas
    const milestonesWeight = 0.4; // 40% importancia a hitos

    if (this.totalTasks() === 0 && this.totalMilestones() === 0) return 0;
    if (this.totalMilestones() === 0) return this.tasksCompletionPct();
    if (this.totalTasks() === 0) return this.milestonesCompletionPct();

    const weightedPct = (this.tasksCompletionPct() * tasksWeight) +
      (this.milestonesCompletionPct() * milestonesWeight);
    return Math.round(weightedPct);
  });

  readonly milestonesRingStyle = computed(() => {
    const pct = this.milestonesCompletionPct();
    return `conic-gradient(#667eea ${pct}%, #edeef8 ${pct}%)`;
  });
}
