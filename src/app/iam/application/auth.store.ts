import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { UserStore } from './user.store';

/**
 * AuthStore (Application Service)
 * Equivalent to the Pinia auth-store — thin wrapper around UserStore.
 * Use AuthGuard to protect routes.
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

  canActivate(): boolean {
    if (this.userStore.isAuthenticated()) {
      return true;
    }
    void this.router.navigate(['/login']); // 'void' quita el warning amarillo
    return false;
  }
}
