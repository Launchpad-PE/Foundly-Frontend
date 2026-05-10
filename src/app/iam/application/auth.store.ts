import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
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
    this.isAuthenticated = this.userStore.isAuthenticated;  // ✅ Es una señal, no función
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

  canActivate(): boolean {
    // ✅ isAuthenticated es una señal, se usa con () para obtener el valor
    if (this.userStore.isAuthenticated()) {
      return true;
    }
    this.router.navigate(['/login']);
    return false;
  }
}
