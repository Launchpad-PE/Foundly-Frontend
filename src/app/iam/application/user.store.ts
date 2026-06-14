import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { RegisterRequest, UsersApi } from '../infrastructure/user-api-service';
import { UserAssembler, RegistrationData, OnboardingData as ApiOnboardingData } from '../infrastructure/user.assembler';
import { ProfileStore, OnboardingData as ProfileOnboardingData } from '../../profile-management/application/profile.store';
import { Experience } from '../../profile-management/domain/entities/experience.entity';
import { ProjectStore } from '../../project-management/application/project-store';

export interface CurrentUser {
  id: string;
  fullName: string;
  email: string;
  token?: string;
}

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
  private projectStore = inject(ProjectStore);
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

      const registerRequest: RegisterRequest = {
        username: registrationData.email,
        email: registrationData.email,
        password: registrationData.password,
        roles: ['ROLE_USER'],
      };

      const response = await firstValueFrom(this.usersApi.register(registerRequest));

      const newUser: CurrentUser = {
        id: response.id.toString(),
        fullName: registrationData.fullName,
        email: registrationData.email,
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

      // Backend uses email as username (set during registration)
      const response = await firstValueFrom(this.usersApi.authenticate(email, password));

      console.log('📡 Respuesta del login:', response);

      if (response?.token) {
        const { id, username, token: authToken } = response;
        this.setToken(authToken);

        const storedUser = localStorage.getItem('currentUser');
        const fullName = storedUser ? (JSON.parse(storedUser).fullName ?? username) : username;

        const user: CurrentUser = { id: id.toString(), fullName, email, token: authToken };
        localStorage.setItem('currentUser', JSON.stringify(user));
        localStorage.setItem('userId', user.id);
        this.currentUser.set(user);

        await this.loadUserProfile(user.id);

        return user;
      } else {
        console.error('❌ No hay token en la respuesta:', response);
        throw new Error('Respuesta de autenticación inválida');
      }
    } catch (err: any) {
      let msg = 'Error al iniciar sesión';
      if (err?.status === 401) msg = 'Credenciales incorrectas';
      else if (err?.error?.message) msg = err.error.message;
      else if (typeof err?.error === 'string') msg = err.error;
      else if (err?.message) msg = err.message;

      this.setError(msg);
      throw new Error(msg);
    } finally {
      this.setLoading(false);
    }
  }

  async completeOnboarding(onboardingData: ApiOnboardingData): Promise<void> {
    try {
      this.setLoading(true);
      this.clearError();

      const user = this.currentUser();
      if (!user || !user.id) {
        throw new Error('No hay usuario autenticado');
      }

      const experiences: Experience[] = (onboardingData.skills?.experiences || []).map((exp: any) => {
        if (exp instanceof Experience) return exp;
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
        return new Experience({ title: exp, company: '', period: '' });
      });

      const profileData: ProfileOnboardingData = {
        username: onboardingData.profile?.username || '',
        avatar: onboardingData.profile?.avatar || null,
        bio: onboardingData.description?.bio || '',
        role: onboardingData.role?.selectedRole || onboardingData.role?.customRole || '',
        skills: onboardingData.skills?.abilities || [],
        experiences: experiences,
      };

      await this.profileStore.createProfile(user.id, profileData);

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

  needsOnboarding(): boolean {
    const profile = this.profileStore.currentProfile();
    return !profile || !profile.isComplete;
  }

  getCurrentProfile() {
    return this.profileStore.currentProfile();
  }

  getProfileCompletion(): number {
    return this.profileStore.getProfileCompletion();
  }

  logout(): void {
    this.currentUser.set(null);
    this.token.set(null);
    this.profileStore.reset();
    this.projectStore.reset(); // ← Limpiar proyectos al hacer logout
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
