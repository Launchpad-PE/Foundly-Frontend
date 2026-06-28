// project-management/presentation/views/project-info/project-info.ts
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ProjectStore } from '../../../application/project-store';
import { UserStore } from '../../../../iam/application/user.store';
import { ProfileStore } from '../../../../profile-management/application/profile.store';
import { Project } from '../../../domain/entities/project.entity';
import { ProjectStatus } from '../../../domain/enum/project-status.enum';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-project-info',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './project-info.html',
  styleUrls: ['./project-info.css'],
})
export class ProjectInfo implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private projectStore = inject(ProjectStore);
  private userStore = inject(UserStore);
  private profileStore = inject(ProfileStore);
  private fb = inject(FormBuilder);

  project: Project | null = null;
  loading = true; // ✅ Inicia en true para mostrar spinner
  error: string | null = null;
  isAuthor = false;
  showApplyForm = false;
  showRoleModal = false;
  selectedRole: any = null;
  favoriteBusy = false;

  applyForm: FormGroup;
  ProjectStatus = ProjectStatus;

  constructor() {
    this.applyForm = this.fb.group({
      message: ['', [Validators.required, Validators.minLength(10)]],
      experience: ['', [Validators.required, Validators.minLength(20)]],
      availability: ['', Validators.required],
    });
  }

  async ngOnInit(): Promise<void> {
    const projectId = this.route.snapshot.params['id'];
    console.log('🔍 ProjectInfo - ID recibido:', projectId);

    // Aseguramos que el perfil esté cargado para saber qué proyectos son favoritos
    const userId = this.userStore.currentUser()?.id;
    if (userId && !this.profileStore.currentProfile()) {
      await this.profileStore.loadProfile(userId.toString());
    }

    if (projectId) {
      await this.loadProject(projectId);
    } else {
      this.error = 'No se especificó un proyecto';
      this.loading = false;
    }
  }

  private async loadProject(projectId: string): Promise<void> {
    this.loading = true;
    this.error = null;

    try {
      // 1. Primero intentar obtener de la caché del store
      let project = this.projectStore.currentProject();

      if (project && project.id === projectId) {
        console.log('✅ Proyecto encontrado en caché');
        this.project = project;
        this.checkAuthor();
        this.loading = false;
        return;
      }

      // 2. Buscar en allProjects (si ya están cargados)
      const allProjects = this.projectStore.allProjects();
      project = allProjects.find((p) => p.id === projectId) || null;

      if (project) {
        console.log('✅ Proyecto encontrado en allProjects');
        this.project = project;
        this.checkAuthor();
        this.loading = false;
        return;
      }

      // 3. Último recurso: cargar todos los proyectos y buscar
      console.log('📡 Cargando todos los proyectos desde API...');
      const loadedProjects = await this.projectStore.loadAllProjects();
      console.log('📡 Proyectos cargados:', loadedProjects.length);

      project = loadedProjects.find((p) => p.id === projectId) || null;

      if (project) {
        console.log('✅ Proyecto encontrado después de carga:', project.name.getValue());
        this.project = project;
        this.checkAuthor();
      } else {
        this.error = `No se encontró el proyecto con ID: ${projectId}`;
        console.error('❌ Proyecto no encontrado');
      }
    } catch (err: any) {
      console.error('❌ Error cargando proyecto:', err);
      this.error = err.message || 'Error al cargar el proyecto';
    } finally {
      this.loading = false;
      console.log('🏁 Finalizado - loading:', this.loading, 'project:', !!this.project);
    }
  }

  private checkAuthor(): void {
    const currentUser = this.userStore.currentUser();
    if (
      currentUser &&
      this.project &&
      this.project.authorId.toString() === currentUser.id?.toString()
    ) {
      this.isAuthor = true;
    }
  }

  getStatusClass(status: ProjectStatus): string {
    const classes: Record<ProjectStatus, string> = {
      [ProjectStatus.DRAFT]: 'status-draft',
      [ProjectStatus.PUBLISHED]: 'status-published',
      [ProjectStatus.IN_PROGRESS]: 'status-progress',
      [ProjectStatus.COMPLETED]: 'status-completed',
      [ProjectStatus.CANCELLED]: 'status-cancelled',
    };
    return classes[status] || 'status-default';
  }

  getStatusLabel(status: ProjectStatus): string {
    const labels: Record<ProjectStatus, string> = {
      [ProjectStatus.DRAFT]: 'Borrador',
      [ProjectStatus.PUBLISHED]: 'Publicado',
      [ProjectStatus.IN_PROGRESS]: 'En Curso',
      [ProjectStatus.COMPLETED]: 'Completado',
      [ProjectStatus.CANCELLED]: 'Cancelado',
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
      day: 'numeric',
    });
  }

  goBack(): void {
    this.router.navigate(['/home']);
  }

  // ── Favoritos ──────────────────────────────────────────────
  get hasProfile(): boolean {
    return !!this.profileStore.currentProfile();
  }

  get isFavorite(): boolean {
    return this.project ? this.profileStore.isFavorite(this.project.id) : false;
  }

  async toggleFavorite(): Promise<void> {
    if (!this.project || this.favoriteBusy) return;

    if (!this.profileStore.currentProfile()) {
      this.error = 'Debes completar tu perfil para guardar favoritos';
      return;
    }

    this.favoriteBusy = true;
    try {
      await this.profileStore.toggleFavorite(this.project.id);
    } catch (err: any) {
      console.error('❌ Error al actualizar favorito:', err);
      this.error = err?.message || 'No se pudo actualizar el favorito';
    } finally {
      this.favoriteBusy = false;
    }
  }
}
