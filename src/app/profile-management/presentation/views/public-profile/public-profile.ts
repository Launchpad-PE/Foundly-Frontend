import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ProfileApi } from '../../../infrastructure/profile-api';
import { Profile } from '../../../domain/entities/profile.entity';

@Component({
  selector: 'app-public-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './public-profile.html',
  styleUrl: './public-profile.css',
})
export class PublicProfileComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private profileApi = inject(ProfileApi);

  profile = signal<Profile | null>(null);
  loading = signal(true);

  showExperiences = false;
  activeTab: 'projects' | 'comments' = 'projects';

  async ngOnInit(): Promise<void> {
    const profileId = this.route.snapshot.params['id'];
    if (!profileId) { this.loading.set(false); return; }

    try {
      const p = await firstValueFrom(this.profileApi.getProfile(profileId));
      this.profile.set(p);
    } catch {
      this.profile.set(null);
    } finally {
      this.loading.set(false);
    }
  }

  toggleExperiences(): void {
    this.showExperiences = !this.showExperiences;
  }

  goBack(): void {
    this.router.navigate(['/home']);
  }
}
