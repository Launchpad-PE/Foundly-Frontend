import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ProfileApi } from '../../../../../profile-management/infrastructure/profile-api';
import { Profile } from '../../../../../profile-management/domain/entities/profile.entity';

@Component({
  selector: 'app-ranking',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ranking.html',
  styleUrl: './ranking.css',
})
export class RankingComponent implements OnInit {
  private profileApi = inject(ProfileApi);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  rankedCollaborators: Profile[] = [];
  loading = true;
  error: string | null = null;

  async ngOnInit(): Promise<void> {
    try {
      const profiles = await firstValueFrom(this.profileApi.getAllProfiles());
      // Sort by skills count as ranking proxy (no points field yet)
      this.rankedCollaborators = [...profiles].sort(
        (a, b) => (b.skills?.length ?? 0) - (a.skills?.length ?? 0)
      );
    } catch (err: any) {
      console.error('Error loading ranking:', err);
      this.error = 'No se pudo cargar el ranking.';
      this.rankedCollaborators = [];
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  getInitials(username: string): string {
    return (username || '')
      .split(' ')
      .slice(0, 2)
      .map(n => n[0] || '')
      .join('')
      .toUpperCase() || '?';
  }

  viewProfile(profileId: string): void {
    this.router.navigate(['/profile', profileId]);
  }

  goBack(): void {
    this.router.navigate(['/collaborators']);
  }
}
