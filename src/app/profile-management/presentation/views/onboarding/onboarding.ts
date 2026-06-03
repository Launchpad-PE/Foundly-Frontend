// profile-management/presentation/views/onboarding/onboarding.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserStore } from '../../../../iam/application/user.store';
import { ProfileStore } from '../../../application/profile.store';
import { ProfileConfigComponent, ProfileConfigData } from '../../components/profile-config/profile-config';
import { SkillsFormComponent, SkillsFormData, ExperienceData } from '../../components/skills-form/skills-form';
import { RoleFormComponent, RoleFormData } from '../../components/role-form/role-form';
import { Experience } from '../../../domain/entities/experience.entity';
import { DescriptionStepComponent, DescriptionStepData } from '../../components/description-step/description-step';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [
    CommonModule,
    ProfileConfigComponent,
    SkillsFormComponent,
    RoleFormComponent,
    DescriptionStepComponent
  ],
  templateUrl: './onboarding.html',
  styleUrls: ['./onboarding.css']
})
export class OnboardingComponent implements OnInit {
  private userStore = inject(UserStore);
  private profileStore = inject(ProfileStore);
  private router = inject(Router);

  currentStep = 1;
  isLoading = false;

  profileData: ProfileConfigData = { username: '', avatar: null };
  skillsData: SkillsFormData = { abilities: [], experiences: [] };
  roleData: RoleFormData = { selectedRole: '', customRole: '' };
  descriptionData: DescriptionStepData = { bio: '' };

  ngOnInit(): void {
    console.log('🔍 Onboarding init - Checking auth status');

    // Verificar autenticación
    if (!this.userStore.isAuthenticated()) {
      console.log(' Not authenticated in onboarding, redirecting to login');
      this.router.navigate(['/login']);
      return;
    }

    // Si ya completó onboarding, redirigir a home
    if (!this.userStore.needsOnboarding()) {
      console.log(' Onboarding already completed, redirecting to home');
      this.router.navigate(['/home']);
      return;
    }

    console.log(' Starting onboarding process for user:', this.userStore.currentUser()?.email);
  }

  nextStep(): void {
    if (this.currentStep < 4) {
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
    const user = this.userStore.currentUser();

    if (!user?.id) {
      this.showError('No hay usuario autenticado');
      this.router.navigate(['/login']);
      return;
    }

    // Validar datos requeridos
    if (!this.profileData.username) {
      this.showError('Por favor ingresa un nombre de usuario');
      this.currentStep = 1;
      return;
    }

    const selectedRole = this.roleData.selectedRole || this.roleData.customRole;
    if (!selectedRole) {
      this.showError('Por favor selecciona un rol');
      this.currentStep = 3;
      return;
    }

    // Convertir experiencias a Experience[]
    const experiences: Experience[] = this.skillsData.experiences.map(exp =>
      new Experience({
        title: exp.title,
        company: exp.company,
        period: exp.period,
      })
    );

    this.isLoading = true;

    try {
      console.log('📝 Creating profile for user:', user.id);

      // Crear perfil
      await this.profileStore.createProfile(user.id, {
        username: this.profileData.username,
        avatar: null,
        bio: this.descriptionData.bio,
        role: selectedRole,
        skills: this.skillsData.abilities,
        experiences: experiences,
      });

      console.log('✅ Onboarding completed successfully');

      // Redirigir al home
      await this.router.navigate(['/home']);
    } catch (error: any) {
      console.error('Error completing onboarding:', error);
      this.showError(error.message || 'Error al completar el onboarding');
    } finally {
      this.isLoading = false;
    }
  }

  private showError(message: string): void {
    alert(message);
  }
}
