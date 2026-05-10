import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserStore } from '../../../../iam/application/user.store';
import { ProfileStore } from '../../../application/profile.store';
import { ProfileConfigComponent, ProfileConfigData } from '../../components/profile-config/profile-config';
import { SkillsFormComponent, SkillsFormData, ExperienceData } from '../../components/skills-form/skills-form';
import { RoleFormComponent, RoleFormData } from '../../components/role-form/role-form';
import { Experience } from '../../../domain/entities/experience.entity';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [
    CommonModule,
    ProfileConfigComponent,
    SkillsFormComponent,
    RoleFormComponent
  ],
  templateUrl: './onboarding.html',
  styleUrls: ['./onboarding.css']
})
export class OnboardingComponent implements OnInit {
  private userStore = inject(UserStore);
  private profileStore = inject(ProfileStore);
  private router = inject(Router);

  currentStep = 1;

  profileData: ProfileConfigData = { username: '', avatar: null };
  skillsData: SkillsFormData = { abilities: [], experiences: [] };
  roleData: RoleFormData = { selectedRole: '', customRole: '' };

  ngOnInit(): void {
    if (!this.userStore.isAuthenticated()) {
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
    const user = this.userStore.currentUser();
    if (!user?.id) {
      alert('No hay usuario autenticado');
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

    try {
      await this.profileStore.createProfile(user.id, {
        username: this.profileData.username,
        avatar: null,
        bio: '',
        role: this.roleData.selectedRole || this.roleData.customRole,
        skills: this.skillsData.abilities,
        experiences: experiences,
      });

      console.log('✅ Onboarding completado');
      this.router.navigate(['/home']);
    } catch (error: any) {
      alert(error.message || 'Error al completar el onboarding');
    }
  }
}
