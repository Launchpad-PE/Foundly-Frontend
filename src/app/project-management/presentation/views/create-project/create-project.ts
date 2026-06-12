import { Component, inject, signal } from '@angular/core';
import { EnvironmentalMetric } from '../../../domain/value-objects/environmental-impact.vo';
import { DurationType } from '../../../domain/value-objects/duration.vo';
import { ProjectStore  } from '../../../application/project-store';
import { UserStore } from '../../../../iam/application/user.store';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { StepInfo } from '../../components/steps/step-info/step-info';
import {StepEvironmental} from '../../components/steps/step-evironmental/step-evironmental';
import {StepSkillsDuration} from '../../components/steps/step-skills-duration/step-skills-duration';
import {StepRoles} from '../../components/steps/step-roles/step-roles';


export interface ProjectFormData {
  name: string;
  area: string;
  tags: string[];
  summary: string;
  hasEnvironmentalImpact: boolean;
  environmentalImpact?: EnvironmentalMetric[]; // ← Esto sigue igual
  academicLevel?: string | null;
  benefits: string[];
  requiredSkills: string[];
  durationAmount: number;
  durationType: DurationType;
  roles: Array<{
    name: string;
    cardInfo: { title: string; items: string[] };
  }>;
}



@Component({
  selector: 'app-create-project',
  imports: [
    StepInfo,
    StepEvironmental,
    StepSkillsDuration,
    StepRoles,
    CommonModule,
    FormsModule,
    RouterModule,
  ],
  templateUrl: './create-project.html',
  styleUrl: './create-project.css',
})

export class CreateProject {
  private projectStore = inject(ProjectStore);
  private userStore = inject(UserStore);
  private router = inject(Router);

  currentStep = signal<number>(1);
  loading = this.projectStore.loading;
  error = this.projectStore.error;

  // Form data inicial
  formData: ProjectFormData = {
    name: '',
    area: '',
    tags: [],
    summary: '',
    hasEnvironmentalImpact: false,
    environmentalImpact: [],
    academicLevel: null,
    benefits: [],
    requiredSkills: [],
    durationAmount: 1,
    durationType: DurationType.MONTHS,
    roles: []
  };

  // Áreas disponibles
  availableAreas = [
    'Tecnología',
    'Ciencia',
    'Arte',
    'Educación',
    'Social',
    'Ambiental'
  ];

  // Niveles académicos
  academicLevels = [
    'Pregrado',
    'Postgrado',
    'Doctorado',
    'Técnico',
    'Autodidacta'
  ];

  // Tipos de duración
  durationTypes = [
    { value: DurationType.WEEKS, label: 'Semanas' },
    { value: DurationType.MONTHS, label: 'Meses' },
    { value: DurationType.SEMESTERS, label: 'Semestres' },
    { value: DurationType.YEARS, label: 'Años' }
  ];

  nextStep(): void {
    if (this.currentStep() < 4) {
      // Validar paso actual antes de avanzar
      if (this.validateCurrentStep()) {
        this.currentStep.update(step => step + 1);
        window.scrollTo(0, 0);
      }
    }
  }

  prevStep(): void {
    if (this.currentStep() > 1) {
      this.currentStep.update(step => step - 1);
      window.scrollTo(0, 0);
    }
  }

  validateCurrentStep(): boolean {
    switch (this.currentStep()) {
      case 1:
        if (!this.formData.name.trim()) {
          alert('Por favor ingresa el nombre del proyecto');
          return false;
        }
        if (!this.formData.area) {
          alert('Por favor selecciona un área');
          return false;
        }
        if (!this.formData.summary.trim()) {
          alert('Por favor ingresa un resumen del proyecto');
          return false;
        }
        return true;
      case 2:
        // Paso 2 es opcional
        return true;
      case 3:
        if (this.formData.requiredSkills.length === 0) {
          alert('Por favor agrega al menos una habilidad requerida');
          return false;
        }
        if (this.formData.benefits.length === 0) {
          alert('Por favor agrega al menos un beneficio');
          return false;
        }
        return true;
      case 4:
        if (this.formData.roles.length === 0) {
          alert('Por favor agrega al menos un rol');
          return false;
        }
        return true;
      default:
        return true;
    }
  }

  async submitProject(): Promise<void> {
    const userId = this.userStore.currentUser()?.id;
    if (!userId) {
      console.error('No user logged in');
      alert('Debes iniciar sesión para crear un proyecto');
      return;
    }

    try {
      const projectData = {
        name: this.formData.name,
        area: this.formData.area,
        tags: this.formData.tags,
        summary: this.formData.summary,
        environmentalMetrics: this.formData.hasEnvironmentalImpact
          ? this.formData.environmentalImpact
          : [],
        academicLevel: this.formData.academicLevel,
        benefits: this.formData.benefits,
        requiredSkills: this.formData.requiredSkills,
        durationAmount: this.formData.durationAmount,
        durationType: this.formData.durationType,
        roles: this.formData.roles
      };

      console.log('📤 Creating project:', JSON.stringify(projectData, null, 2));

      const createdProject = await this.projectStore.createProject(projectData, userId);
      console.log('✅ Project created successfully:', createdProject);
      this.router.navigate(['/projects']);
    } catch (error) {
      console.error('❌ Error creating project:', error);
      alert('Error al crear el proyecto. Revisa la consola.');
    }
  }

  cancel(): void {
    if (confirm('¿Estás seguro de que quieres cancelar? Se perderán todos los datos ingresados.')) {
      this.router.navigate(['/projects']);
    }
  }

  // Métodos para actualizar datos desde los steps
  updateBasicInfo(data: Partial<ProjectFormData>): void {
    Object.assign(this.formData, data);
  }

  updateEnvironmental(data: Partial<ProjectFormData>): void {
    Object.assign(this.formData, data);
  }

  updateSkillsDuration(data: Partial<ProjectFormData>): void {
    Object.assign(this.formData, data);
  }

  updateRoles(data: Partial<ProjectFormData>): void {
    Object.assign(this.formData, data);
  }
}
