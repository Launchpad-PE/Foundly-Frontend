import { Injectable } from '@angular/core';
import { User } from '../domain/model/user.entity';

export interface UserApiData {
  id?: string;
  fullName?: string;
  email?: string;
  password?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RegistrationData {
  fullName: string;
  email: string;
  password: string;
}

export interface OnboardingData {
  profile?: { avatar: string | null; username: string };
  role?: { selectedRole: string; customRole: string };
  description?: { bio: string };
  skills?: { abilities: string[]; experiences: string[]; cv: File | null };
}

/**
 * User Assembler
 * Transforms data between API and domain entities
 */
@Injectable({ providedIn: 'root' })
export class UserAssembler {
  static fromApiToEntity(apiData: UserApiData | null): User | null {
    if (!apiData) return null;

    return new User({
      id: apiData.id ?? null,
      fullName: apiData.fullName ?? '',
      email: apiData.email ?? '',
      password: apiData.password ?? '',
      status: apiData.status ?? 'active',
      createdAt: apiData.createdAt ?? null,
      updatedAt: apiData.updatedAt ?? null,
    });
  }

  static fromEntityToApi(entity: User | null): UserApiData | null {
    if (!entity) return null;

    return {
      id: entity.id ?? undefined,
      fullName: entity.fullName,
      email: entity.email,
      password: entity.password,
      status: entity.status,
      createdAt: entity.createdAt?.toISOString(),
      updatedAt: entity.updatedAt?.toISOString(),
    };
  }

  // ✅ CORREGIDO: Asegurar que los campos requeridos no sean undefined
  static fromRegistrationToApi(registrationData: RegistrationData): UserApiData {
    return {
      fullName: registrationData.fullName,  // ✅ string obligatorio
      email: registrationData.email,        // ✅ string obligatorio
      password: registrationData.password,  // ✅ string obligatorio
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  static fromOnboardingToApi(onboardingData: OnboardingData): Partial<UserApiData> {
    return {
      updatedAt: new Date().toISOString(),
    };
  }
}
