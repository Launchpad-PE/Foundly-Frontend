// shared/presentation/collaborators/views/collaborators.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CollaboratorCardComponent } from '../../home/components/collaborator-card/collaborator-card';
import { UserStore } from '../../../../iam/application/user.store';

interface Collaborator {
  id: string;
  name: string;
  role: string;
  skills: string[];
  avatar?: string;
}

@Component({
  selector: 'app-collaborators',
  standalone: true,
  imports: [CommonModule, FormsModule, CollaboratorCardComponent, RouterLink, RouterLinkActive],
  templateUrl: './collaborators.component.html',
  styleUrls: ['./collaborators.component.css'],
})
export class CollaboratorsComponent implements OnInit {
  private userStore = inject(UserStore);
  private router = inject(Router);

  searchTerm: string = '';
  filterRole: string = '';
  filterSkill: string = '';

  allCollaborators: Collaborator[] = [
    {
      id: '1',
      name: 'Christian Gonzalez',
      role: 'Arquitecto de Software',
      skills: ['JavaScript', 'Angular', 'Node.js', 'Arquitectura'],
    },
    {
      id: '2',
      name: 'Diana Briceño',
      role: 'Desarrollador Full Stack',
      skills: ['React', 'Python', 'Django', 'PostgreSQL'],
    },
    {
      id: '3',
      name: 'Mario Baca',
      role: 'Desarrollador de Videojuegos',
      skills: ['Unity', 'C#', 'Blender', 'Game Design'],
    },
    {
      id: '4',
      name: 'Ana López',
      role: 'UX Designer',
      skills: ['Figma', 'Adobe XD', 'User Research', 'Prototyping'],
    },
    {
      id: '5',
      name: 'Carlos Ruiz',
      role: 'Product Manager',
      skills: ['Agile', 'Scrum', 'Analytics', 'Leadership'],
    },
    {
      id: '6',
      name: 'María García',
      role: 'Data Analyst',
      skills: ['Python', 'Pandas', 'SQL', 'Tableau'],
    },
  ];

  get filteredCollaborators(): Collaborator[] {
    return this.allCollaborators.filter((collaborator) => {
      const matchesName =
        this.searchTerm === '' ||
        collaborator.name.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesRole =
        this.filterRole === '' ||
        collaborator.role.toLowerCase().includes(this.filterRole.toLowerCase());
      const matchesSkill =
        this.filterSkill === '' ||
        collaborator.skills.some((skill) =>
          skill.toLowerCase().includes(this.filterSkill.toLowerCase()),
        );
      return matchesName && matchesRole && matchesSkill;
    });
  }

  ngOnInit(): void {
    if (this.userStore.needsOnboarding()) {
      this.router.navigate(['/onboarding']);
    }
  }

  logout(): void {
    this.userStore.logout();
    this.router.navigate(['/login']);
  }

  viewProfile(collaboratorId: string): void {
    console.log('View profile:', collaboratorId);
    // Navigate to profile view
  }
}
