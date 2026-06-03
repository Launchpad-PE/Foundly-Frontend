import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProjectStore } from '../../../application/project-store';
import { Project } from '../../../domain/entities/project.entity';
import { EnvironmentalMetric } from '../../../domain/value-objects/environmental-impact.vo';
import { IotDashboardComponent } from '../../../../environmental-monitoring/presentation/views/iot-dashboard/iot-dashboard';
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

  project = signal<Project | null>(null);
  activeTab = signal<Tab>('inicio');
  loading = signal(true);
  selectedMilestoneId = signal<string | null>(null);

  // ── Computed helpers ───────────────────────────────────
  get projectName(): string {
    return this.project()?.name.getValue() ?? '';
  }

  get hasIot(): boolean {
    return (this.project()?.environmentalImpact?.getMetrics().length ?? 0) > 0;
  }

  get iotMetrics(): EnvironmentalMetric[] {
    return this.project()?.environmentalImpact?.getMetrics() ?? [];
  }

  get projectId(): string {
    return this.project()?.id ?? '';
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
  readonly urgentTasksList = computed(() =>
    this.taskStore.projectTasks().filter(t => t.isDelayed())
  );

  // ── Lifecycle ──────────────────────────────────────────
  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/projects']);
      return;
    }
    const p = await this.projectStore.loadProject(id);
    this.project.set(p);
    if (p) {
      this.applicationStore.loadApplicationsByProject(p.id);
      this.taskStore.loadTasksByProject(p.id);
    }
    this.loading.set(false);
  }

  setTab(tab: Tab): void {
    this.activeTab.set(tab);
    if (tab !== 'hitos') {
      this.selectedMilestoneId.set(null);
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
}
