// shared/presentation/home/views/home.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { ProjectCardComponent } from '../components/project-card/projectc-card';
import { CollaboratorCardComponent } from '../components/collaborator-card/collaborator-card';
import { UserStore } from '../../../../iam/application/user.store';

interface Project {
  id: string;
  title: string;
  roles: string[];
  areas: string[];
  duration: string;
  modality: string;
  author: string;
  postedAt: Date;
  isHighlighted?: boolean;
}

interface Collaborator {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  isHighlighted?: boolean;
  skills?: string[]; // Added skills field
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ProjectCardComponent,
    CollaboratorCardComponent,
    RouterLink,
    RouterLinkActive,
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  private userStore = inject(UserStore);
  private router = inject(Router);

  currentPlan: string = 'Gratuito';
  searchTerm: string = '';
  filterRole: string = '';
  filterArea: string = '';

  highlightedCollaborators: Collaborator[] = [
    {
      id: '1',
      name: 'Christian Gonzalez',
      role: 'Arquitecto de Software',
      skills: ['JavaScript', 'Angular'],
    },
    {
      id: '2',
      name: 'Diana Briceño',
      role: 'Desarrollador Full Stack',
      skills: ['React', 'Python'],
    },
    { id: '3', name: 'Mario Baca', role: 'Desarrollador de Videojuegos', skills: ['Unity', 'C#'] },
  ];

  featuredProjects: Project[] = [
    {
      id: 'f1',
      title: 'Plataforma de E-Learning',
      roles: ['Desarrollador UX', 'Desarrollador Frontend', 'Analistas de datos'],
      areas: ['Tecnología', 'Desarrollo Web'],
      duration: '3 meses',
      modality: 'Remoto',
      author: 'Roberto Tello',
      postedAt: new Date(),
      isHighlighted: true,
    },
    {
      id: 'f2',
      title: 'Aplicación de Finanzas Personales',
      roles: ['UX Designer', 'Backend dev', 'Psicology Clínico', 'Product Owner', 'Analista'],
      areas: ['Salud', 'Bienestar'],
      duration: '2 meses',
      modality: 'Remoto',
      author: 'María García',
      postedAt: new Date(),
      isHighlighted: true,
    },
    {
      id: 'f3',
      title: 'Aplicación de Finanzas Personales',
      roles: ['Product Manager', 'Analista de datos'],
      areas: ['Finanzas', 'Tecnología'],
      duration: '12 meses',
      modality: 'Híbrido',
      author: 'Carlos Ruiz',
      postedAt: new Date(),
    },
    {
      id: 'f4',
      title: 'Startup de Energías Renovables',
      roles: ['Ingeniero Industrial', 'Full Stack Dev'],
      areas: ['Energía', 'Renovación'],
      duration: '12 meses',
      modality: 'Híbrido',
      author: 'Luis Torres',
      postedAt: new Date(),
    },
  ];

  allProjects: Project[] = [
    {
      id: '1',
      title: 'Plataforma de E-Learning',
      roles: ['Desarrollador UX', 'Desarrollador Frontend', 'Analistas de datos'],
      areas: ['Tecnología', 'Desarrollo Web'],
      duration: '3 meses',
      modality: 'Remoto',
      author: 'Roberto Tello',
      postedAt: new Date(),
      isHighlighted: true,
    },
    {
      id: '2',
      title: 'Plataforma de Gestión de Finanzas',
      roles: ['Desarrollador Frontend (Vue)', 'Desarrollador Backend (.NET)'],
      areas: ['Finanzas', 'Tecnología'],
      duration: '6 meses',
      modality: 'Híbrido',
      author: 'Ana Pérez',
      postedAt: new Date(),
    },
  ];

  ngOnInit(): void {
    if (this.userStore.needsOnboarding()) {
      this.router.navigate(['/onboarding']);
    }
  }

  logout(): void {
    this.userStore.logout();
    this.router.navigate(['/login']);
  }

  onSearch(): void {
    console.log('Searching:', {
      term: this.searchTerm,
      role: this.filterRole,
      area: this.filterArea,
    });
  }

  applyToProject(projectId: string): void {
    console.log('Applying to project:', projectId);
  }

  viewProjectDetails(projectId: string): void {
    console.log('View project details:', projectId);
  }

  viewProfile(collaboratorId: string): void {
    console.log('View collaborator profile:', collaboratorId);
    // Navigate to collaborator profile or collaborators page
    this.router.navigate(['/collaborators']);
  }

  isParticipatingIn(projectId: string): boolean {
    // TODO: Implement logic to check if user is already participating in this project
    return false;
  }
}
