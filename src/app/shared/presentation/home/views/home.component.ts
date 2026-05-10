// shared/presentation/home/views/home.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
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
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ProjectCardComponent,
    CollaboratorCardComponent
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  private userStore = inject(UserStore);
  private router = inject(Router);

  currentPlan: string = 'Gratuito';
  searchTerm: string = '';

  highlightedCollaborators: Collaborator[] = [
    { id: '1', name: 'Christian Gonzalez', role: 'Arquitecto de Software', isHighlighted: true },
    { id: '2', name: 'Diana Briceño', role: 'Desarrollador Full Stack', isHighlighted: true },
    { id: '3', name: 'Mario Baca', role: 'Desarrollador de Videojuegos', isHighlighted: true }
  ];

  featuredProjects: Project[] = [
    {
      id: '1',
      title: 'Plataforma de E-Learning',
      roles: ['Desarrollador UX', 'Desarrollador Frontend', 'Analistas de datos'],
      areas: ['Tecnología', 'Desarrollo Web'],
      duration: '3 meses',
      modality: 'Remoto',
      author: 'Roberto Tello',
      postedAt: new Date(),
      isHighlighted: true
    },
    {
      id: '2',
      title: 'Aplicación de Finanzas Personales',
      roles: ['UX Designer', 'Modeler UI/UX', 'Product Owner'],
      areas: ['Finanzas', 'Servicios'],
      duration: '2 meses',
      modality: 'Remoto',
      author: 'María García',
      postedAt: new Date(),
      isHighlighted: true
    },
    {
      id: '3',
      title: 'Startup de Energías Renovables',
      roles: ['Ingeniero Industrial', 'Full Stack Dev'],
      areas: ['Energía', 'Innovación'],
      duration: '12 meses',
      modality: 'Híbrido',
      author: 'Carlos Ruiz',
      postedAt: new Date()
    }
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
      isHighlighted: true
    }
  ];

  ngOnInit(): void {
    // Verificar si necesita onboarding
    if (this.userStore.needsOnboarding()) {
      console.log('📝 Needs onboarding, redirecting...');
      this.router.navigate(['/onboarding']);
    }
  }

  logout(): void {
    this.userStore.logout();
    this.router.navigate(['/login']);
  }

  onSearch(): void {
    console.log('Searching for:', this.searchTerm);
  }

  applyToProject(projectId: string): void {
    console.log('Applying to project:', projectId);
  }

  viewProjectDetails(projectId: string): void {
    console.log('View project details:', projectId);
  }
}
