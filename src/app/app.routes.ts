// app.routes.ts
import { Routes } from '@angular/router';
import { AuthGuard } from './iam/application/auth.store';

const baseTitle = 'Foundly';

// Lazy loading de vistas
const login = () => import('./iam/presentation/views/login/login').then(m => m.LoginComponent);
const register = () => import('./iam/presentation/views/register/register').then(m => m.RegisterComponent);
const recoveryPassword = () => import('./iam/presentation/views/recovery-password/recovery-password').then(m => m.RecoveryPasswordComponent);
const onboarding = () => import('./profile-management/presentation/views/onboarding/onboarding').then(m => m.OnboardingComponent);
const home = () => import('./shared/presentation/home/views/home.component').then(m => m.HomeComponent);
const collaborators = () => import('./shared/presentation/collaborators/views/collaborators.component').then(m => m.CollaboratorsComponent);

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: login,
    title: `${baseTitle} - Iniciar Sesión`
  },
  {
    path: 'register',
    loadComponent: register,
    title: `${baseTitle} - Registrarse`
  },
  {
    path: 'recovery-password',
    loadComponent: recoveryPassword,
    title: `${baseTitle} - Recuperar Contraseña`
  },
  {
    path: 'create-account',
    loadComponent: onboarding,
    canActivate: [AuthGuard],
    title: `${baseTitle} - Completar Perfil`
  },
  {
    path: 'onboarding',
    loadComponent: onboarding,
    canActivate: [AuthGuard],
    title: `${baseTitle} - Completar Perfil`
  },
  {
    path: 'home',
    loadComponent: home,
    canActivate: [AuthGuard],
    title: `${baseTitle} - Inicio`
  },
  {
    path: 'collaborators',
    loadComponent: collaborators,
    canActivate: [AuthGuard],
    title: `${baseTitle} - Colaboradores`
  },
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: '/login'
  },
];
