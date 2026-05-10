import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { UsersApi } from '../infrastructure/user-api-endpoints';
import { UserAssembler, RegistrationData, OnboardingData as ApiOnboardingData } from '../infrastructure/user.assembler';
// Profile Store
import { ProfileStore, OnboardingData as ProfileOnboardingData } from '../../profile-management/application/profile.store';
// Entities
import { Experience } from '../../profile-management/domain/entities/experience.entity';

export interface CurrentUser {
  id: string;
  fullName: string;
  email: string;
  token?: string;
}

/**
 * UserStore (Application Service)
 * Equivalent to the Pinia user-store — manages auth state using Angular signals.
 */
@Injectable({ providedIn: 'root' })
export class UserStore {
  // State signals
  readonly currentUser = signal<CurrentUser | null>(null);
  readonly loading = signal<boolean>(false);
  readonly error = signal<string | null>(null);
  readonly token = signal<string | null>(localStorage.getItem('authToken'));

  // Computed
  readonly isAuthenticated = computed(() => !!this.currentUser() && !!this.token());

  // Dependencies
  private profileStore = inject(ProfileStore);
  private router = inject(Router);

  constructor(private usersApi: UsersApi) {
    this.initializeUser();
  }

  // ── private helpers ──────────────────────────────────────────────────────────

  private setLoading(value: boolean): void { this.loading.set(value); }
  private setError(msg: string | null): void { this.error.set(msg); }
  private clearError(): void { this.error.set(null); }

  private setToken(newToken: string | null): void {
    this.token.set(newToken);
    if (newToken) {
      localStorage.setItem('authToken', newToken);
    } else {
      localStorage.removeItem('authToken');
    }
  }

  // ── public actions ───────────────────────────────────────────────────────────

  async register(registrationData: RegistrationData): Promise<CurrentUser> {
    try {
      this.setLoading(true);
      this.clearError();

      const apiData = UserAssembler.fromRegistrationToApi(registrationData);
      const response = await firstValueFrom(this.usersApi.register(apiData));

      const newUser: CurrentUser = {
        id: response.id,
        fullName: apiData.fullName!,
        email: apiData.email!,
      };

      localStorage.setItem('currentUser', JSON.stringify(newUser));
      localStorage.setItem('userId', newUser.id);
      this.currentUser.set(newUser);

      return newUser;
    } catch (err: any) {
      const msg = err?.error?.message ?? err?.message ?? 'Error en el registro';
      this.setError(msg);
      throw err;
    } finally {
      this.setLoading(false);
    }
  }

  async login(email: string, password: string): Promise<CurrentUser> {
    try {
      this.setLoading(true);
      this.clearError();

      console.log('🔐 Attempting login:', email);
      const response = await firstValueFrom(this.usersApi.authenticate(email, password));

      if (response?.token) {
        const { id, fullName, token: authToken } = response;
        this.setToken(authToken);

        const user: CurrentUser = { id, fullName, email, token: authToken };
        localStorage.setItem('currentUser', JSON.stringify(user));
        localStorage.setItem('userId', user.id);
        this.currentUser.set(user);

        console.log('✅ Login successful:', fullName);

        // 🔥 Cargar el perfil del usuario después del login
        await this.loadUserProfile(user.id);

        return user;
      } else {
        throw new Error('Respuesta de autenticación inválida');
      }
    } catch (err: any) {
      let msg = 'Error al iniciar sesión';
      if (err?.status === 401) msg = 'Credenciales incorrectas';
      else if (err?.error) msg = err.error;
      else if (err?.message) msg = err.message;

      this.setError(msg);
      throw new Error(msg);
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * 🔥 Completar onboarding - crea el perfil del usuario
   */
  async completeOnboarding(onboardingData: ApiOnboardingData): Promise<void> {
    try {
      this.setLoading(true);
      this.clearError();

      const user = this.currentUser();
      if (!user || !user.id) {
        throw new Error('No hay usuario autenticado');
      }

      // ✅ Convertir experiencias de string[] a Experience[]
      const experiences: Experience[] = (onboardingData.skills?.experiences || []).map((exp: any) => {
        // Si ya es una instancia de Experience, usarla directamente
        if (exp instanceof Experience) {
          return exp;
        }
        // Si es un objeto, crear un Experience
        if (typeof exp === 'object') {
          return new Experience({
            title: exp.title || '',
            company: exp.company || '',
            period: exp.period || '',
            description: exp.description || null,
            current: exp.current || false,
            startDate: exp.startDate ? new Date(exp.startDate) : null,
            endDate: exp.endDate ? new Date(exp.endDate) : null,
          });
        }
        // Si es string, crear Experience básico
        return new Experience({
          title: exp,
          company: '',
          period: '',
        });
      });

      // Transformar datos del onboarding al formato que espera ProfileStore
      const profileData: ProfileOnboardingData = {
        username: onboardingData.profile?.username || '',
        avatar: onboardingData.profile?.avatar || null,
        bio: onboardingData.description?.bio || '',
        role: onboardingData.role?.selectedRole || onboardingData.role?.customRole || '',
        skills: onboardingData.skills?.abilities || [],
        experiences: experiences,  // ✅ Ahora es Experience[]
      };

      // Crear el perfil usando ProfileStore
      await this.profileStore.createProfile(user.id, profileData);

      // Guardar información adicional en el UserStore si es necesario
      const apiData = UserAssembler.fromOnboardingToApi(onboardingData);
      const updatedUser: CurrentUser = { ...user, ...apiData };

      this.currentUser.set(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));

      console.log('✅ Onboarding completado exitosamente');
    } catch (err: any) {
      const msg = err?.message || 'Error al completar el onboarding';
      this.setError(msg);
      throw err;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * 🔥 Cargar el perfil del usuario después del login
   */
  private async loadUserProfile(userId: string): Promise<void> {
    try {
      const profile = await this.profileStore.loadProfile(userId);
      if (profile) {
        console.log('📋 Profile loaded:', profile.username);
      } else {
        console.log('📋 No profile found for user, needs onboarding');
      }
    } catch (err) {
      console.error('Error loading profile:', err);
    }
  }

  /**
   * 🔥 Verificar si el usuario necesita completar onboarding
   */
  needsOnboarding(): boolean {
    const profile = this.profileStore.currentProfile();
    return !profile || !profile.isComplete;
  }

  /**
   * 🔥 Obtener el perfil actual (proxy a ProfileStore)
   */
  getCurrentProfile() {
    return this.profileStore.currentProfile();
  }

  /**
   * 🔥 Obtener el progreso del perfil
   */
  getProfileCompletion(): number {
    return this.profileStore.getProfileCompletion();
  }

  logout(): void {
    this.currentUser.set(null);
    this.token.set(null);
    this.profileStore.reset();
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userId');
    localStorage.removeItem('authToken');
  }

  initializeUser(): void {
    const storedUser = localStorage.getItem('currentUser');
    const storedToken = localStorage.getItem('authToken');

    if (storedUser && storedToken) {
      try {
        const user = JSON.parse(storedUser);
        this.currentUser.set(user);
        this.token.set(storedToken);

        if (user.id) {
          this.loadUserProfile(user.id);
        }
      } catch {
        this.logout();
      }
    }
  }
}
