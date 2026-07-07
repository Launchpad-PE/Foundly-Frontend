import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { ProjectStore } from '../../../../project-management/application/project-store';
import { ApplicationStore } from '../../../application/application.store';
import { UserStore } from '../../../../iam/application/user.store';
import { Project } from '../../../../project-management/domain/entities/project.entity';
import { TranslatePipe } from '@ngx-translate/core';

interface ApplyFormData {
  fullName: string;
  email: string;
  portfolioUrl: string;
  phone: string;
  roleId: string;
  cvUrl: string;
  message: string;
  acceptedTerms: boolean;
}

@Component({
  selector: 'app-apply-project',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './apply-project.html',
  styleUrls: ['./apply-project.css']
})
export class ApplyProjectComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private projectStore = inject(ProjectStore);
  private applicationStore = inject(ApplicationStore);
  private userStore = inject(UserStore);

  project = signal<Project | null>(null);
  loading = signal<boolean>(true);
  submitting = computed(() => this.applicationStore.loading());
  errorMessage = signal<string>('');
  successMessage = signal<string>('');

  formData: ApplyFormData = {
    fullName: '',
    email: '',
    portfolioUrl: '',
    phone: '',
    roleId: '',
    cvUrl: '',
    message: '',
    acceptedTerms: false
  };

  async ngOnInit(): Promise<void> {
    const projectId = this.route.snapshot.paramMap.get('id');
    if (!projectId) {
      this.router.navigate(['/home']);  // ✅ Cambiar a home
      return;
    }

    // Prefill desde el usuario logueado
    const currentUser = this.userStore.currentUser();
    if (currentUser) {
      this.formData.fullName = currentUser.fullName ?? '';
      this.formData.email = currentUser.email ?? '';
    }

    // Cargar el proyecto
    this.loading.set(true);  // ✅ Asegurar que loading esté true
    try {
      // Intentar cargar directamente desde el store/API
      let project = this.projectStore.currentProject();
      if (!project || project.id !== projectId) {
        project = await this.projectStore.loadProject(projectId);
      }

      if (!project) {
        const allProjects = await this.projectStore.loadAllProjects();
        project = allProjects.find(p => p.id === projectId) || null;
      }

      if (!project) {
        this.errorMessage.set('No se encontró el proyecto.');
        this.loading.set(false);
        return;
      }

      this.project.set(project);
    } catch (err) {
      this.errorMessage.set('Error al cargar el proyecto.');
    } finally {
      this.loading.set(false);
    }
  }

  goBack(): void {
    this.router.navigate(['/home']);  // ✅ Navegar a home
  }

  cancel(): void {
    if (confirm('¿Estás seguro de que quieres cancelar? Se perderán los datos ingresados.')) {
      this.goBack();
    }
  }

  private validate(): string | null {
    if (!this.formData.fullName.trim()) return 'Ingresa tu nombre completo.';
    if (!this.formData.email.trim()) return 'Ingresa tu correo.';
    if (!this.formData.roleId) return 'Selecciona uno de los puestos.';
    if (!this.formData.cvUrl.trim()) return 'Ingresa el enlace a tu CV (Drive, LinkedIn, etc.).';
    if (!this.formData.message.trim()) return 'Escribe un mensaje de presentación.';
    if (this.formData.message.trim().length < 10) return 'El mensaje debe tener al menos 10 caracteres.';
    if (!this.formData.acceptedTerms) return 'Debes aceptar los términos y el tratamiento de datos.';
    return null;
  }

  async submit(): Promise<void> {
    this.errorMessage.set('');
    this.successMessage.set('');

    const validationError = this.validate();
    if (validationError) {
      this.errorMessage.set(validationError);
      return;
    }

    const currentUser = this.userStore.currentUser();
    if (!currentUser) {
      this.errorMessage.set('Debes iniciar sesión para postular.');
      return;
    }

    const project = this.project();
    if (!project) {
      this.errorMessage.set('No hay un proyecto cargado.');
      return;
    }

    try {
      await this.applicationStore.submitApplication(
        {
          projectId: project.id,
          roleId: this.formData.roleId,
          fullName: this.formData.fullName.trim(),
          email: this.formData.email.trim(),
          portfolioUrl: this.formData.portfolioUrl.trim() || null,
          phone: this.formData.phone.trim() || null,
          cvUrl: this.formData.cvUrl.trim(),
          message: this.formData.message.trim(),
          acceptedTerms: this.formData.acceptedTerms
        },
        currentUser.id
      );

      this.successMessage.set('¡Postulación enviada con éxito!');
      setTimeout(() => {
        this.router.navigate(['/projects/info', project.id]);
      }, 1200);
    } catch (err: any) {
      this.errorMessage.set(err?.message ?? 'Error al enviar la postulación.');
    }
  }

  // Helper para el template — el Role del dominio no expone el id (se pierde en el assembler),
  // así que usamos el nombre como identificador estable dentro del proyecto.
  roleOptions(): Array<{ id: string; name: string }> {
    const proj = this.project();
    if (!proj) return [];
    return proj.roles.map(r => ({
      id: r.name.getValue(),
      name: r.name.getValue()
    }));
  }
}
