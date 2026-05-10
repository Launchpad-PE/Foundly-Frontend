import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserStore } from '../../application/user.store';
import { ProgressStepperComponent } from '../components/progress-stepper.component';
import { ProfileStepComponent, ProfileStepData } from '../components/profile-step.component';
import { RoleStepComponent, RoleStepData } from '../components/role-step.component';
import { DescriptionStepComponent, DescriptionStepData } from '../components/description-step.component';

interface OnboardingFormData {
  profile: ProfileStepData;
  role: RoleStepData;
  description: DescriptionStepData;
  skills: { abilities: string[]; experiences: string[]; cv: File | null };
}

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [
    CommonModule,
    ProgressStepperComponent,
    ProfileStepComponent,
    RoleStepComponent,
    DescriptionStepComponent,
  ],
  template: `
    <div class="onboarding-container">
      <!-- Header -->
      <header class="onboarding-header">
        <div class="header-content">
          <img src="/logo.png" alt="Foundly Logo" class="logo" />
        </div>
      </header>

      <!-- Progress Stepper -->
      <div class="progress-stepper-wrapper">
        <div class="progress-stepper-container">
          <app-progress-stepper [currentStep]="currentStep" [totalSteps]="4" />
        </div>
      </div>

      <!-- Step Content -->
      <div class="onboarding-main">
        <div class="onboarding-content">
          <!-- Paso 1: Perfil -->
          <app-profile-step
            *ngIf="currentStep === 1"
            [(modelValue)]="formData.profile"
            (next)="nextStep()"
          />

          <!-- Paso 2: Rol -->
          <app-role-step
            *ngIf="currentStep === 2"
            [(modelValue)]="formData.role"
            (next)="nextStep()"
            (prev)="prevStep()"
          />

          <!-- Paso 3: Descripción -->
          <app-description-step
            *ngIf="currentStep === 3"
            [(modelValue)]="formData.description"
            (complete)="completeOnboarding()"
            (prev)="prevStep()"
          />
        </div>
      </div>
    </div>
  `,
  styles: [`
    .onboarding-container { min-height: 100vh; display: flex; flex-direction: column; background: #fff; }
    .onboarding-header {
      background-color: #fff; border-bottom: 1px solid #e2e8f0;
      padding: 1rem; position: sticky; top: 0; z-index: 100;
      display: flex; justify-content: space-between; align-items: center;
    }
    .header-content { margin: 0; padding: 0 2rem; display: flex; }
    .logo { height: 60px; width: auto; object-fit: contain; }
    .progress-stepper-wrapper { display: flex; justify-content: center; align-items: center; padding: 1rem 0; width: 100%; }
    .progress-stepper-container { width: 100%; max-width: 400px; margin: 0 auto; }
    .onboarding-main { display: flex; justify-content: center; align-items: flex-start; flex: 1; padding: 2rem; margin-top: 1rem; }
    .onboarding-content { width: 100%; max-width: 500px; display: flex; justify-content: center; }
    @media (max-width: 768px) {
      .header-content { padding: 0 1rem; }
      .progress-stepper-container { max-width: 70%; padding: 0 1rem; }
      .onboarding-main { padding: 1.5rem 1rem; margin-top: 0.5rem; }
      .onboarding-content { max-width: 100%; }
    }
  `]
})
export class OnboardingComponent implements OnInit {
  currentStep = 1;

  formData: OnboardingFormData = {
    profile: { avatar: null, username: '' },
    role: { selectedRole: '', customRole: '' },
    description: { bio: '' },
    skills: { abilities: [], experiences: [], cv: null },
  };

  constructor(public userStore: UserStore, private router: Router) {}

  ngOnInit(): void {
    if (!this.userStore.isAuthenticated()) {
      console.log('❌ Usuario no autenticado, redirigiendo a login');
      this.router.navigate(['/login']);
    }
  }

  nextStep(): void {
    if (this.currentStep < 3) {
      this.currentStep++;
    } else {
      this.completeOnboarding();
    }
  }

  prevStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  async completeOnboarding(): Promise<void> {
    try {
      if (!this.userStore.currentUser()) {
        throw new Error('No hay usuario autenticado');
      }

      await this.userStore.completeOnboarding(this.formData);
      console.log('✅ Onboarding completado exitosamente');
      this.router.navigate(['/profile']);
    } catch (error: any) {
      alert(error.message || 'Error al completar el onboarding');
    }
  }
}
