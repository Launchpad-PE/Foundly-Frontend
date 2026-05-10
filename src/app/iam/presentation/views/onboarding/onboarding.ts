import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserStore } from '../../../application/user.store';
import { ProgressStepperComponent } from '../../components/progress-stepper/progress-stepper';
import { ProfileStepComponent, ProfileStepData } from '../../components/profile-step/profile-step';
import { RoleStepComponent, RoleStepData } from '../../components/role-step/role-step';
import { DescriptionStepComponent, DescriptionStepData } from '../../components/description-step/description-step';

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
  templateUrl: './onboarding.html',
  styleUrls: ['./onboarding.css']
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
