// collaborators.component.ts
import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CollaboratorList } from '../components/collaborator-list/collaborator-list';
import { UserStore } from '../../../../iam/application/user.store';
import { ProfileApi } from '../../../../profile-management/infrastructure/profile-api';
import { Profile } from '../../../../profile-management/domain/entities/profile.entity';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-collaborators',
  standalone: true,
  imports: [CommonModule, FormsModule, CollaboratorList],
  templateUrl: './collaborators.component.html',
  styleUrls: ['./collaborators.component.css'],
})
export class CollaboratorsComponent implements OnInit {
  private userStore = inject(UserStore);
  private router = inject(Router);
  private profileApi = inject(ProfileApi);
  private cdr = inject(ChangeDetectorRef);

  // Filters
  searchTerm = '';
  filterRole = '';
  filterSkill = '';
  minScore: number | null = null;
  maxScore: number | null = null;

  // Data
  allCollaborators: Profile[] = [];
  loading = true;
  error: string | null = null;

  // Sidebar stats (mock — no points field in Profile yet)
  userPoints = 220;
  userRanking = 500;
  activeProjects = 2;

  get filteredCollaborators(): Profile[] {
    return this.allCollaborators.filter(c => {
      const term = this.searchTerm.toLowerCase();
      const matchesName = !this.searchTerm ||
        c.username.toLowerCase().includes(term) ||
        c.skills.some(s => s.toLowerCase().includes(term));

      const matchesRole = !this.filterRole ||
        c.role.toLowerCase().includes(this.filterRole.toLowerCase());

      return matchesName && matchesRole;
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
    } catch (err: any) {
      this.error = 'Error al cargar los colaboradores';
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  onSearch(): void {
    this.cdr.detectChanges();
  }

  onClear(): void {
    this.searchTerm = '';
    this.filterRole = '';
    this.filterSkill = '';
    this.minScore = null;
    this.maxScore = null;
  }

  viewProfile(collaboratorId: string): void {
    this.router.navigate(['/profile', collaboratorId]);
  }

  goToRanking(): void {
    this.router.navigate(['/collaborators/ranking']);
  }
}
