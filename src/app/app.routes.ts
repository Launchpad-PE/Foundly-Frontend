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
const projects = () => import('./shared/presentation/projects/views/project-view').then(m => m.ProjectsComponent);
const createProject = () => import('./project-management/presentation/views/create-project/create-project')
  .then(m => m.CreateProject);
const projectDetail = () => import('./project-management/presentation/views/project-detail/project-detail')
  .then(m => m.ProjectDetailComponent);
const projectInfo = () => import('./project-management/presentation/views/project-info/project-info')
  .then(m => m.ProjectInfo);
const applyProject = () => import('./applications/presentation/views/apply-project/apply-project')
  .then(m => m.ApplyProjectComponent);
const postulantDetail = () => import('./applications/presentation/views/postulant-detail/postulant-detail')
  .then(m => m.PostulantDetailComponent);
const participatingProject = () => import('./project-management/presentation/views/participating-project/participating-project')
  .then(m => m.ParticipatingProjectComponent);
const taskDetail = () => import('./task-management/presentation/views/task-detail/task-detail')
  .then(m => m.TaskDetailComponent);
const profile = () => import('./profile-management/presentation/views/profile/profile')
  .then(m => m.ProfileComponent);
const publicProfile = () => import('./profile-management/presentation/views/public-profile/public-profile')
  .then(m => m.PublicProfileComponent);
const chat = () => import('./messaging/presentation/views/chat/chat')
  .then(m => m.ChatComponent);
const ranking = () => import('./shared/presentation/collaborators/views/ranking/ranking')
  .then(m => m.RankingComponent);
const deliverTask = () => import('./milestones-management/presentation/views/deliver-task/deliver-task.component')
  .then(m => m.DeliverTaskComponent);

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
    path: 'projects',  // Ruta para proyectos
    loadComponent: projects,
    canActivate: [AuthGuard],
    title: `${baseTitle} - Proyectos`
  },
  {
    path: 'projects/create',
    loadComponent: createProject,
    canActivate: [AuthGuard],
    title: `${baseTitle} - Crear Proyecto`
  },
  {
    path: 'projects/:id',
    loadComponent: projectDetail,
    canActivate: [AuthGuard],
    title: `${baseTitle} - Detalle del Proyecto`
  },
  {
    path: 'projects/info/:id',
    loadComponent: projectInfo,
    canActivate: [AuthGuard],
    title: `${baseTitle} - Detalle del Proyecto`
  },
  {
    path: 'projects/:id/apply',
    loadComponent: applyProject,
    canActivate: [AuthGuard],
    title: `${baseTitle} - Postular a un Proyecto`
  },
  {
    path: 'projects/:id/postulantes/:applicationId',
    loadComponent: postulantDetail,
    canActivate: [AuthGuard],
    title: `${baseTitle} - Detalle del Postulante`
  },
  {
    path: 'projects/:id/participating',
    loadComponent: participatingProject,
    canActivate: [AuthGuard],
    title: `${baseTitle} - Mi Proyecto`
  },
  {
    path: 'projects/:id/tasks/:taskId',
    loadComponent: taskDetail,
    canActivate: [AuthGuard],
    title: `${baseTitle} - Detalle de Tarea`
  },
  {
    path: 'projects/:id/hitos/:milestoneId/tareas/:taskId/entregar',
    loadComponent: deliverTask,
    canActivate: [AuthGuard],
    title: `${baseTitle} - Entregar Tarea`
  },
  {
    path: 'profile',
    loadComponent: profile,
    canActivate: [AuthGuard],
    title: `${baseTitle} - Mi Perfil`
  },
  {
    path: 'collaborators/ranking',
    loadComponent: ranking,
    canActivate: [AuthGuard],
    title: `${baseTitle} - Ranking de Colaboradores`
  },
  {
    path: 'profile/:id',
    loadComponent: publicProfile,
    canActivate: [AuthGuard],
    title: `${baseTitle} - Perfil`
  },
  {
    path: 'messages',
    loadComponent: chat,
    canActivate: [AuthGuard],
    title: `${baseTitle} - Mensajes`
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
