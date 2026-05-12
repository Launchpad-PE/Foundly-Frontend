/**
 * User Entity
 * Represents a user in the domain with business logic and validation
 */
export class User {
  id: string | null;
  fullName: string;
  email: string;
  password: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;

  constructor({
    id = null as string | null,
    fullName = '',
    email = '',
    password = '',
    status = 'active',
    createdAt = null as string | null,
    updatedAt = null as string | null,
  } = {}) {
    this.id = id;
    this.fullName = fullName;
    this.email = email;
    this.password = password;
    this.status = status;
    this.createdAt = createdAt ? new Date(createdAt) : new Date();
    this.updatedAt = updatedAt ? new Date(updatedAt) : new Date();
  }

  // Business logic methods
  isActive(): boolean {
    return this.status === 'active';
  }

  isInactive(): boolean {
    return this.status === 'inactive';
  }

  // Validation methods
  validateRegistration(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.fullName.trim()) {
      errors.push('Full name is required');
    }

    if (!this.email.trim()) {
      errors.push('Email is required');
    } else if (!this.isValidEmail(this.email)) {
      errors.push('Valid email is required');
    }

    if (!this.password) {
      errors.push('Password is required');
    } else if (this.password.length < 6) {
      errors.push('Password must be at least 6 characters long');
    }

    return { isValid: errors.length === 0, errors };
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Security methods
  maskPassword(): Partial<User> {
    return { ...this, password: '***' };
  }

  // Profile completion
  getProfileCompletion(): number {
    let completion = 0;
    const totalFields = 7;

    if (this.fullName) completion += 1;
    if (this.email) completion += 1;

    return Math.round((completion / totalFields) * 100);
  }
}
