import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProjectStore } from '../../../application/project-store';
import { Project } from '../../../domain/entities/project.entity';
import { EnvironmentalMetric } from '../../../domain/value-objects/environmental-impact.vo';
import { IotDashboardComponent } from '../../../../environmental-monitoring/presentation/views/iot-dashboard/iot-dashboard';

type Tab = 'inicio' | 'tareas' | 'iot' | 'hitos' | 'postulantes';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, IotDashboardComponent],
  templateUrl: './project-detail.html',
  styleUrls: ['./project-detail.css']
})
export class ProjectDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private projectStore = inject(ProjectStore);

  project = signal<Project | null>(null);
  activeTab = signal<Tab>('inicio');
  loading = signal(true);

  get projectName(): string {
    return this.project()?.name.getValue() ?? '';
  }

  get hasIot(): boolean {
    return (this.project()?.environmentalImpact?.getMetrics().length ?? 0) > 0;
  }

  get iotMetrics(): EnvironmentalMetric[] {
    return this.project()?.environmentalImpact?.getMetrics() ?? [];
  }

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/projects']);
      return;
    }
    const p = await this.projectStore.loadProject(id);
    this.project.set(p);
    this.loading.set(false);
  }

  setTab(tab: Tab): void {
    this.activeTab.set(tab);
  }

  goBack(): void {
    this.router.navigate(['/projects']);
  }
}
