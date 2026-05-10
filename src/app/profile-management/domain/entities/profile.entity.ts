import { Experience } from './experience.entity';

/**
 * Profile Entity
 * Represents a user's profile after onboarding
 */
export class Profile {
  id: string | null;
  userId: string;
  username: string;
  avatar: string | null;
  bio: string;
  role: string;
  skills: string[];  // Array de strings con las habilidades
  experiences: Experience[];  // Array de experiencias
  isComplete: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor({
                id = null as string | null,
                userId = '',
                username = '',
                avatar = null as string | null,
                bio = '',
                role = '',
                skills = [] as string[],
                experiences = [] as Experience[],
                isComplete = false,
                createdAt = null as string | null,
                updatedAt = null as string | null,
              } = {}) {
    this.id = id;
    this.userId = userId;
    this.username = username;
    this.avatar = avatar;
    this.bio = bio;
    this.role = role;
    this.skills = skills;
    this.experiences = experiences;
    this.isComplete = isComplete;
    this.createdAt = createdAt ? new Date(createdAt) : new Date();
    this.updatedAt = updatedAt ? new Date(updatedAt) : new Date();
  }

  // Business logic methods
  isProfileComplete(): boolean {
    return this.isComplete;
  }

  hasSkills(): boolean {
    return this.skills.length > 0;
  }

  hasExperiences(): boolean {
    return this.experiences.length > 0;
  }

  // Validation methods for onboarding
  validateOnboarding(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.username.trim()) {
      errors.push('Username es requerido');
    } else if (this.username.length < 3) {
      errors.push('Username debe tener al menos 3 caracteres');
    }

    if (!this.role.trim()) {
      errors.push('Rol es requerido');
    }

    return { isValid: errors.length === 0, errors };
  }

  // Profile completion calculation
  getProfileCompletion(): number {
    let completion = 0;
    const totalFields = 5;

    if (this.username) completion++;
    if (this.avatar) completion++;
    if (this.bio) completion++;
    if (this.role) completion++;
    if (this.skills.length > 0) completion++;

    return Math.round((completion / totalFields) * 100);
  }

  // Utility methods
  addSkill(skill: string): void {
    if (!this.skills.includes(skill)) {
      this.skills.push(skill);
      this.updatedAt = new Date();
    }
  }

  removeSkill(skill: string): void {
    this.skills = this.skills.filter(s => s !== skill);
    this.updatedAt = new Date();
  }

  addExperience(experience: Experience): void {
    this.experiences.push(experience);
    this.updatedAt = new Date();
  }

  removeExperience(experienceId: string): void {
    this.experiences = this.experiences.filter(e => e.id !== experienceId);
    this.updatedAt = new Date();
  }

  // Safe version for logging
  maskSensitiveData(): Partial<Profile> {
    return { ...this, userId: '***' };
  }
}
