import { Injectable, signal, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Profile } from '../domain/entities/profile.entity';
import { Experience } from '../domain/entities/experience.entity';
import { ProfileApi } from '../infrastructure/profile-api';

export interface OnboardingData {
  username: string;
  avatar: string | null;
  bio: string;
  role: string;
  skills: string[];
  experiences: Experience[];
}

@Injectable({ providedIn: 'root' })
export class ProfileStore {
  // Signals for reactive state
  currentProfile = signal<Profile | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);
  onboardingStep = signal(1);

  // Dependencies
  private profileApi = inject(ProfileApi);

  /**
   * Create a new profile during onboarding
   */
  async createProfile(userId: string, data: OnboardingData): Promise<Profile> {
    this.loading.set(true);
    this.error.set(null);

    try {
      //  Usar el constructor directamente en lugar de Profile.create()
      const profile = new Profile({
        userId: userId,
        username: data.username,
        avatar: data.avatar,
        bio: data.bio,
        role: data.role,
        skills: data.skills,
        experiences: data.experiences,
        isComplete: true,
      });

      // Validate profile
      const validation = profile.validateOnboarding();
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      // Send to API
      const savedProfile = await firstValueFrom(this.profileApi.createProfile(profile));

      this.currentProfile.set(savedProfile);

      console.log('✅ Profile created successfully', savedProfile);
      return savedProfile;
    } catch (err: any) {
      this.error.set(err.message);
      throw err;
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Load profile by user ID
   */
  async loadProfile(userId: string): Promise<Profile | null> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const profile = await firstValueFrom(this.profileApi.getProfileByUserId(userId));
      this.currentProfile.set(profile);
      return profile;
    } catch (err: any) {
      if (err.status === 404) {
        console.log('📋 No profile found for user');
        return null;
      }
      this.error.set(err.message);
      return null;
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Update profile
   */
  async updateProfile(profile: Profile): Promise<Profile> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const updatedProfile = await firstValueFrom(this.profileApi.updateProfile(profile));
      this.currentProfile.set(updatedProfile);
      return updatedProfile;
    } catch (err: any) {
      this.error.set(err.message);
      throw err;
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Update username only
   */
  async updateUsername(username: string): Promise<void> {
    const profile = this.currentProfile();
    if (!profile || !profile.id) {
      throw new Error('No profile loaded');
    }

    const updated = await firstValueFrom(this.profileApi.patchProfile(profile.id, { username }));
    this.currentProfile.set(updated);
  }

  /**
   * Update bio only
   */
  async updateBio(bio: string): Promise<void> {
    const profile = this.currentProfile();
    if (!profile || !profile.id) {
      throw new Error('No profile loaded');
    }

    const updated = await firstValueFrom(this.profileApi.patchProfile(profile.id, { bio }));
    this.currentProfile.set(updated);
  }

  /**
   * Update role only
   */
  async updateRole(role: string): Promise<void> {
    const profile = this.currentProfile();
    if (!profile || !profile.id) {
      throw new Error('No profile loaded');
    }

    const updated = await firstValueFrom(this.profileApi.patchProfile(profile.id, { role }));
    this.currentProfile.set(updated);
  }

  /**
   * Update avatar (si la página asigna uno automáticamente)
   */
  async updateAvatar(avatarUrl: string | null): Promise<void> {
    const profile = this.currentProfile();
    if (!profile || !profile.id) {
      throw new Error('No profile loaded');
    }

    const updated = await firstValueFrom(this.profileApi.patchProfile(profile.id, { avatar: avatarUrl }));
    this.currentProfile.set(updated);
  }

  /**
   * Add a skill
   */
  async addSkill(skill: string): Promise<void> {
    const profile = this.currentProfile();
    if (!profile || !profile.id) {
      throw new Error('No profile loaded');
    }

    const updated = await firstValueFrom(this.profileApi.addSkill(profile.id, skill));
    this.currentProfile.set(updated);
  }

  /**
   * Remove a skill
   */
  async removeSkill(skill: string): Promise<void> {
    const profile = this.currentProfile();
    if (!profile || !profile.id) {
      throw new Error('No profile loaded');
    }

    const updated = await firstValueFrom(this.profileApi.removeSkill(profile.id, skill));
    this.currentProfile.set(updated);
  }

  /**
   * Add experience
   */
  async addExperience(experience: Experience): Promise<void> {
    const profile = this.currentProfile();
    if (!profile || !profile.id) {
      throw new Error('No profile loaded');
    }

    // Convertir Experience a formato para la API
    const expData = {
      title: experience.title,
      company: experience.company,
      period: experience.period,
      description: experience.description,
      current: experience.current,
      startDate: experience.startDate ? experience.startDate.toISOString() : null,
      endDate: experience.endDate ? experience.endDate.toISOString() : null,
    };

    const updated = await firstValueFrom(this.profileApi.addExperience(profile.id, expData));
    this.currentProfile.set(updated);
  }

  /**
   * Remove experience
   */
  async removeExperience(experienceId: string): Promise<void> {
    const profile = this.currentProfile();
    if (!profile || !profile.id) {
      throw new Error('No profile loaded');
    }

    const updated = await firstValueFrom(this.profileApi.removeExperience(profile.id, experienceId));
    this.currentProfile.set(updated);
  }

  /**
   * Reemplaza el array completo de experiencias (usado para agregar/eliminar
   * de forma segura, evitando el problema de ids nulos).
   */
  async setExperiences(experiences: Experience[]): Promise<void> {
    const profile = this.currentProfile();
    if (!profile || !profile.id) {
      throw new Error('No profile loaded');
    }

    const data = experiences.map(e => this.experienceToData(e));
    const updated = await firstValueFrom(this.profileApi.setExperiences(profile.id, data));
    this.currentProfile.set(updated);
  }

  private experienceToData(exp: Experience): any {
    return {
      id: exp.id ?? this.generateId(),
      title: exp.title,
      company: exp.company,
      period: exp.period,
      description: exp.description ?? null,
      current: exp.current,
      startDate: exp.startDate ? exp.startDate.toISOString() : null,
      endDate: exp.endDate ? exp.endDate.toISOString() : null,
      createdAt: exp.createdAt ? exp.createdAt.toISOString() : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  private generateId(): string {
    const c: any = (globalThis as any).crypto;
    if (c && typeof c.randomUUID === 'function') {
      return c.randomUUID();
    }
    return `exp_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  }

  /**
   * Update basic info (username, role, bio) en un solo PATCH
   */
  async updateBasicInfo(data: { username?: string; role?: string; bio?: string }): Promise<void> {
    const profile = this.currentProfile();
    if (!profile || !profile.id) {
      throw new Error('No profile loaded');
    }

    const updated = await firstValueFrom(this.profileApi.patchProfile(profile.id, data));
    this.currentProfile.set(updated);
  }

  /**
   * Check si un proyecto es favorito del perfil actual
   */
  isFavorite(projectId: string): boolean {
    const profile = this.currentProfile();
    return profile ? profile.isFavorite(projectId) : false;
  }

  /**
   * Alterna un proyecto entre favoritos / no favoritos y persiste el cambio
   */
  async toggleFavorite(projectId: string): Promise<boolean> {
    const profile = this.currentProfile();
    if (!profile || !profile.id) {
      throw new Error('No profile loaded');
    }

    const id = projectId.toString();
    const willBeFavorite = !profile.isFavorite(id);

    const updated = willBeFavorite
      ? await firstValueFrom(this.profileApi.addFavorite(profile.id, id))
      : await firstValueFrom(this.profileApi.removeFavorite(profile.id, id));

    this.currentProfile.set(updated);
    return willBeFavorite;
  }

  /**
   * Get profile completion percentage
   */
  getProfileCompletion(): number {
    const profile = this.currentProfile();
    return profile ? profile.getProfileCompletion() : 0;
  }

  /**
   * Check if profile is complete
   */
  isProfileComplete(): boolean {
    const profile = this.currentProfile();
    return profile ? profile.isProfileComplete() : false;
  }

  /**
   * Set onboarding step
   */
  setOnboardingStep(step: number): void {
    this.onboardingStep.set(step);
  }

  /**
   * Reset profile store
   */
  reset(): void {
    this.currentProfile.set(null);
    this.loading.set(false);
    this.error.set(null);
    this.onboardingStep.set(1);
  }
}
