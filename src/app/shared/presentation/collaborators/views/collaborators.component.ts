// shared/presentation/collaborators/views/collaborators.component.ts
import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import {CollaboratorList} from '../components/collaborator-list/collaborator-list';
import { UserStore } from '../../../../iam/application/user.store';
import { ProfileApi } from '../../../../profile-management/infrastructure/profile-api';
import { Profile } from '../../../../profile-management/domain/entities/profile.entity';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-collaborators',
  standalone: true,
  imports: [CommonModule, FormsModule, CollaboratorList ,RouterLink, RouterLinkActive],
  templateUrl: './collaborators.component.html',
  styleUrls: ['./collaborators.component.css'],
})
export class CollaboratorsComponent implements OnInit {
  private userStore = inject(UserStore);
  private router = inject(Router);
  private profileApi = inject(ProfileApi);
  private cdr = inject(ChangeDetectorRef);

  searchTerm: string = '';
  filterRole: string = '';
  filterSkill: string = '';

  allCollaborators: Profile[] = [];
  loading: boolean = true;
  error: string | null = null;

  get filteredCollaborators(): Profile[] {
    return this.allCollaborators.filter((collaborator) => {
      const matchesName =
        this.searchTerm === '' ||
        collaborator.username.toLowerCase().includes(this.searchTerm.toLowerCase());

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

  async ngOnInit(): Promise<void> {
    if (this.userStore.needsOnboarding()) {
      this.router.navigate(['/onboarding']);
      return;
    }

    await this.loadAllCollaborators();
  }

  async loadAllCollaborators(): Promise<void> {
    this.loading = true;
    this.error = null;

    try {
      const profiles = await firstValueFrom(this.profileApi.getAllProfiles());
      this.allCollaborators = profiles;
      this.cdr.detectChanges();
      console.log('✅ Collaborators loaded:', this.allCollaborators);
    } catch (err: any) {
      console.error('Error loading collaborators:', err);
      this.error = err.message || 'Error al cargar los colaboradores';
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  logout(): void {
    this.userStore.logout();
    this.router.navigate(['/login']);
  }

  viewProfile(collaboratorId: string): void {
    this.router.navigate(['/profile', collaboratorId]);
  }
}
