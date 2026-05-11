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
  ) {
    // Ensure UserStore has time to initialize
    this.userStore;
  }

  private isUserAuthenticated(): boolean {
    // Primary check: UserStore state
    const storeIsAuthenticated = this.userStore.isAuthenticated();

    // Secondary check: localStorage persistence (for page refreshes/navigation)
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('currentUser');

    // If store says authenticated OR storage has both token and user, user is authenticated
    return storeIsAuthenticated || (!!token && !!user);
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const isAuthenticated = this.isUserAuthenticated();
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('currentUser');

    console.log('🔍 AuthGuard checking:', {
      isAuthenticated,
      hasToken: !!token,
      hasUser: !!user,
      path: state.url,
      storeUser: !!this.userStore.currentUser()
    });

    if (!isAuthenticated) {
      console.log('❌ Not authenticated, redirecting to login');
      this.router.navigate(['/login']);
      return false;
    }

    console.log('✅ Authenticated, allowing access to:', state.url);
    return true;
  }
}
