// iam/application/auth.store.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { UserStore } from './user.store';

/**
 * AuthStore (Application Service)
 * Equivalent to the Pinia auth-store — thin wrapper around UserStore.
 */
@Injectable({ providedIn: 'root' })
export class AuthStore {
  readonly currentUser;
  readonly isAuthenticated;

  constructor(private userStore: UserStore) {
    this.currentUser = this.userStore.currentUser;
    this.isAuthenticated = this.userStore.isAuthenticated;
  }

  async login(credentials: { email: string; password: string; userId?: string }) {
    return this.userStore.login(credentials.email, credentials.password);
  }

  logout(): void {
    this.userStore.logout();
  }
}

/**
 * AuthGuard — protects routes that require authentication.
 * Use in route definitions: canActivate: [AuthGuard]
 */
@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(
    private userStore: UserStore,
    private router: Router,
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    // Verificar si está autenticado
    const isAuthenticated = this.userStore.isAuthenticated();

    console.log('🔍 AuthGuard Debug:', {
      isAuthenticated,
      currentPath: state.url,
      hasUser: !!this.userStore.currentUser()
    });

    // Si NO está autenticado, siempre redirigir al login
    if (!isAuthenticated) {
      console.log('❌ Not authenticated, redirecting to login');
      this.router.navigate(['/login']);
      return false;
    }

    // Si está autenticado, permitir el acceso a la ruta solicitada
    // El componente se encargará de verificar si necesita onboarding internamente
    console.log('✅ Authenticated, allowing access to:', state.url);
    return true;
  }
}
