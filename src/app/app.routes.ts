import { Routes } from '@angular/router';
import { AuthGuard } from './iam/application/auth.store';

const baseTitle = 'Foundly';

// Lazy loading de vistas
const login = () => import('./iam/presentation/views/login/login').then(m => m.LoginComponent);
const register = () => import('./iam/presentation/views/register/register').then(m => m.RegisterComponent);
const recoveryPassword = () => import('./iam/presentation/views/recovery-password/recovery-password').then(m => m.RecoveryPasswordComponent);
const onboarding = () => import('./profile-management/presentation/views/onboarding/onboarding').then(m => m.OnboardingComponent);

export const routes: Routes = [
  { path: 'login', loadComponent: login, title: `${baseTitle} - Iniciar Sesión` },
  { path: 'register', loadComponent: register, title: `${baseTitle} - Registrarse`
  },
  { path: 'recovery-password', loadComponent: recoveryPassword, title: `${baseTitle} - Recuperar Contraseña`
  },
  { path: 'create-account', loadComponent: onboarding, canActivate: [AuthGuard], title: `${baseTitle} - Completar Perfil`
  },
  { path: 'onboarding', loadComponent: onboarding, canActivate: [AuthGuard], title: `${baseTitle} - Completar Perfil` },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' },
];
