import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { UsersApi } from '../infrastructure/user-api.service';
import { UserAssembler, RegistrationData, OnboardingData } from '../infrastructure/user.assembler';

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

  constructor(private usersApi: UsersApi, private router: Router) {
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

  async completeOnboarding(onboardingData: OnboardingData): Promise<CurrentUser> {
    try {
      this.setLoading(true);
      this.clearError();

      const user = this.currentUser();
      if (!user) throw new Error('No hay usuario logueado');

      const apiData = UserAssembler.fromOnboardingToApi(onboardingData);
      const updatedUser: CurrentUser = { ...user, ...apiData };

      this.currentUser.set(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));

      return updatedUser;
    } catch (err: any) {
      this.setError('Error al completar el onboarding');
      throw err;
    } finally {
      this.setLoading(false);
    }
  }

  logout(): void {
    this.currentUser.set(null);
    this.token.set(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userId');
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentProfile');
    localStorage.removeItem('profileId');
  }

  initializeUser(): void {
    const storedUser = localStorage.getItem('currentUser');
    const storedToken = localStorage.getItem('authToken');

    if (storedUser && storedToken) {
      try {
        this.currentUser.set(JSON.parse(storedUser));
        this.token.set(storedToken);
      } catch {
        this.logout();
      }
    }
  }
}
