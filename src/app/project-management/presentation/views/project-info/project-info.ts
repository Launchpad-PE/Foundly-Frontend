// project-management/presentation/views/project-info/project-info.ts
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProjectStore } from '../../../application/project-store';
import { UserStore } from '../../../../iam/application/user.store';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { Project } from '../../../domain/entities/project.entity';
import { ProjectStatus } from '../../../domain/enum/project-status.enum';

@Component({
  selector: 'app-project-info',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './project-info.html',
  styleUrls: ['./project-info.css'],
})
export class ProjectInfo implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private projectStore = inject(ProjectStore);
  private userStore = inject(UserStore);
  private fb = inject(FormBuilder);
  private destroy$ = new Subject<void>();

  project: Project | null = null;
  loading = false;  // ✅ Siempre false para que nunca muestre el spinner
  error: string | null = null;
  isAuthor = false;
  showApplyForm = false;
  showRoleModal = false;
  selectedRole: any = null;

  applyForm: FormGroup;
  ProjectStatus = ProjectStatus;
  statusOptions = [
    { value: ProjectStatus.DRAFT, label: 'Borrador' },
    { value: ProjectStatus.PUBLISHED, label: 'Publicado' },
    { value: ProjectStatus.IN_PROGRESS, label: 'En Curso' },
    { value: ProjectStatus.COMPLETED, label: 'Completado' },
    { value: ProjectStatus.CANCELLED, label: 'Cancelado' }
  ];

  constructor() {
    this.applyForm = this.fb.group({
      message: ['', [Validators.required, Validators.minLength(10)]],
      experience: ['', [Validators.required, Validators.minLength(20)]],
      availability: ['', Validators.required]
    });
  }

  async ngOnInit(): Promise<void> {
    const projectId = this.route.snapshot.params['id'];
    console.log('🔍 ProjectInfo - ID recibido:', projectId);

    if (projectId) {
      // ✅ Cargar sin mostrar loading
      await this.loadProjectDirect(projectId);
    } else {
      this.error = 'No se especificó un proyecto';
    }
  }

  // ✅ Nuevo método: carga los datos directamente sin loading
  private async loadProjectDirect(projectId: string): Promise<void> {
    try {
      // Intentar obtener de la caché del store primero
      this.project = this.projectStore.currentProject();

      // Si no está en caché, cargar todos los proyectos y buscar
      if (!this.project || this.project.id !== projectId) {
        const allProjects = await this.projectStore.loadAllProjects();
        this.project = allProjects.find(p => p.id === projectId) || null;
      }

      console.log('✅ Proyecto encontrado:', this.project);

      if (!this.project) {
        this.error = 'Proyecto no encontrado';
        return;
      }

      const currentUser = this.userStore.currentUser();
      if (currentUser && this.project.authorId.toString() === currentUser.id?.toString()) {
        this.isAuthor = true;
      }

    } catch (err: any) {
      console.error('Error cargando proyecto:', err);
      this.error = err.message || 'Error al cargar el proyecto';
    }
  }

  getStatusClass(status: ProjectStatus): string {
    const classes = {
      [ProjectStatus.DRAFT]: 'status-draft',
      [ProjectStatus.PUBLISHED]: 'status-published',
      [ProjectStatus.IN_PROGRESS]: 'status-progress',
      [ProjectStatus.COMPLETED]: 'status-completed',
      [ProjectStatus.CANCELLED]: 'status-cancelled'
    };
    return classes[status] || 'status-default';
  }

  getStatusLabel(status: ProjectStatus): string {
    const labels: Record<ProjectStatus, string> = {
      [ProjectStatus.DRAFT]: 'Borrador',
      [ProjectStatus.PUBLISHED]: 'Publicado',
      [ProjectStatus.IN_PROGRESS]: 'En Curso',
      [ProjectStatus.COMPLETED]: 'Completado',
      [ProjectStatus.CANCELLED]: 'Cancelado'
    };
    return labels[status] || status;
  }

  getDurationText(): string {
    if (!this.project) return '';
    const amount = this.project.duration.getAmount();
    const type = this.project.duration.getType();
    return `${amount} ${type}`;
  }

  getEnvironmentalMetrics(): string[] {
    if (!this.project?.environmentalImpact) return [];
    return this.project.environmentalImpact.getMetrics();
  }

  getAcademicLevel(): string | null {
    return this.project?.academicLevel?.getValue() ?? null;
  }

  hasAcademicLevel(): boolean {
    return !!this.project?.academicLevel?.getValue();
  }


  openApplyForm(role?: any): void {
    this.selectedRole = role || null;
    this.showApplyForm = true;
  }

  closeApplyForm(): void {
    this.showApplyForm = false;
    this.selectedRole = null;
    this.applyForm.reset();
  }

  openRoleModal(role: any): void {
    this.selectedRole = role;
    this.showRoleModal = true;
  }

  closeRoleModal(): void {
    this.showRoleModal = false;
    this.selectedRole = null;
  }

  formatDate(date: Date): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  goBack(): void {
    this.router.navigate(['/projects']);
  }
}
