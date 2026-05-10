import { Injectable, signal } from '@angular/core';
import { Profile } from '../domain/entities/profile.entity';
import { Experience } from '../domain/entities/experience.entity';

export interface OnboardingData {
  username: string;
  avatar: string | null;
  bio: string;
  role: string;
  skills: string[];
  experiences: Experience[];  // ✅ Ahora es array de Experience, no de string
}

@Injectable({ providedIn: 'root' })
export class ProfileStore {
  // Signals for reactive state
  currentProfile = signal<Profile | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);
  onboardingStep = signal(1);

  constructor() {
    // Load profile from localStorage on init
    this.loadFromLocalStorage();
  }

  /**
   * Create a new profile during onboarding
   */
  async createProfile(userId: string, data: OnboardingData): Promise<Profile> {
    this.loading.set(true);
    this.error.set(null);

    try {
      // Create profile entity
      const profile = new Profile({
        userId: userId,
        username: data.username,
        avatar: data.avatar,
        bio: data.bio,
        role: data.role,
        skills: data.skills,
        experiences: data.experiences,  // ✅ Ahora es array de Experience
        isComplete: true,
      });

      // Validate profile
      const validation = profile.validateOnboarding();
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      // Simulate API call
      await this.simulateApiCall();

      // Save to localStorage
      this.saveToLocalStorage(profile);
      this.currentProfile.set(profile);

      console.log('✅ Profile created successfully', profile);
      return profile;
    } catch (err: any) {
      this.error.set(err.message);
      throw err;
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Update existing profile
   */
  async updateProfile(profile: Profile): Promise<Profile> {
    this.loading.set(true);
    this.error.set(null);

    try {
      profile.updatedAt = new Date();

      // TODO: Update in backend API
      // await this.http.put(`/api/profiles/${profile.id}`, profile.toJSON());

      // Simulate API call
      await this.simulateApiCall();

      // Save to localStorage
      this.saveToLocalStorage(profile);
      this.currentProfile.set(profile);

      console.log('✅ Profile updated successfully', profile);
      return profile;
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
      // TODO: Fetch from backend API
      // const response = await this.http.get(`/api/profiles/user/${userId}`);

      // Simulate API call
      await this.simulateApiCall();

      // Try to load from localStorage first (for demo)
      const stored = localStorage.getItem(`profile_${userId}`);
      if (stored) {
        const data = JSON.parse(stored);
        const profile = new Profile(data);
        this.currentProfile.set(profile);
        return profile;
      }

      return null;
    } catch (err: any) {
      this.error.set(err.message);
      return null;
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Update username
   */
  async updateUsername(username: string): Promise<void> {
    const profile = this.currentProfile();
    if (!profile) {
      throw new Error('No profile loaded');
    }

    profile.username = username;
    profile.updatedAt = new Date();
    await this.updateProfile(profile);
  }

  /**
   * Update avatar
   */
  async updateAvatar(avatarUrl: string | null): Promise<void> {
    const profile = this.currentProfile();
    if (!profile) {
      throw new Error('No profile loaded');
    }

    profile.avatar = avatarUrl;
    profile.updatedAt = new Date();
    await this.updateProfile(profile);
  }

  /**
   * Update bio
   */
  async updateBio(bio: string): Promise<void> {
    const profile = this.currentProfile();
    if (!profile) {
      throw new Error('No profile loaded');
    }

    profile.bio = bio;
    profile.updatedAt = new Date();
    await this.updateProfile(profile);
  }

  /**
   * Update role
   */
  async updateRole(role: string): Promise<void> {
    const profile = this.currentProfile();
    if (!profile) {
      throw new Error('No profile loaded');
    }

    profile.role = role;
    profile.updatedAt = new Date();
    await this.updateProfile(profile);
  }

  /**
   * Add a skill
   */
  async addSkill(skill: string): Promise<void> {
    const profile = this.currentProfile();
    if (!profile) {
      throw new Error('No profile loaded');
    }

    profile.addSkill(skill);
    await this.updateProfile(profile);
  }

  /**
   * Remove a skill
   */
  async removeSkill(skill: string): Promise<void> {
    const profile = this.currentProfile();
    if (!profile) {
      throw new Error('No profile loaded');
    }

    profile.removeSkill(skill);
    await this.updateProfile(profile);
  }

  /**
   * Add experience
   */
  async addExperience(experience: Experience): Promise<void> {
    const profile = this.currentProfile();
    if (!profile) {
      throw new Error('No profile loaded');
    }

    profile.addExperience(experience);
    await this.updateProfile(profile);
  }

  /**
   * Remove experience
   */
  async removeExperience(experienceId: string): Promise<void> {
    const profile = this.currentProfile();
    if (!profile) {
      throw new Error('No profile loaded');
    }

    profile.removeExperience(experienceId);
    await this.updateProfile(profile);
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
   * Next onboarding step
   */
  nextStep(): void {
    const current = this.onboardingStep();
    if (current < 3) {
      this.onboardingStep.set(current + 1);
    }
  }

  /**
   * Previous onboarding step
   */
  prevStep(): void {
    const current = this.onboardingStep();
    if (current > 1) {
      this.onboardingStep.set(current - 1);
    }
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

  /**
   * Clear all errors
   */
  clearError(): void {
    this.error.set(null);
  }

  // Private helper methods
  private saveToLocalStorage(profile: Profile): void {
    localStorage.setItem(`profile_${profile.userId}`, JSON.stringify({
      id: profile.id,
      userId: profile.userId,
      username: profile.username,
      avatar: profile.avatar,
      bio: profile.bio,
      role: profile.role,
      skills: profile.skills,
      experiences: profile.experiences,
      isComplete: profile.isComplete,
      createdAt: profile.createdAt.toISOString(),
      updatedAt: profile.updatedAt.toISOString(),
    }));
  }

  private loadFromLocalStorage(): void {
    // This would be called with a specific userId from auth
    // For now, just a placeholder
    const userId = localStorage.getItem('currentUserId');
    if (userId) {
      this.loadProfile(userId);
    }
  }

  private async simulateApiCall(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, 500));
  }
}
