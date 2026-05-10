import { Routes } from '@angular/router';
import { AuthGuard } from './iam/application/auth.store';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./iam/presentation/views/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./iam/presentation/views/register.component').then((m) => m.RegisterComponent),
  },
  {
    path: 'recovery-password',
    loadComponent: () =>
      import('./iam/presentation/views/recovery-password.component').then(
        (m) => m.RecoveryPasswordComponent,
      ),
  },
  {
    path: 'create-account',
    loadComponent: () =>
      import('./iam/presentation/views/onboarding.component').then((m) => m.OnboardingComponent),
    canActivate: [AuthGuard],
  },
  // Add your other routes here:
  // { path: 'home', ... canActivate: [AuthGuard] },
  // { path: 'profile', ... canActivate: [AuthGuard] },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' },
];
