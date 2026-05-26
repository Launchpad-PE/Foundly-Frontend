import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { ApplicationStore } from '../../../application/application.store';
import { Application } from '../../../domain/entities/application.entity';
import { ApplicationStatus } from '../../../domain/enum/application-status.enum';

@Component({
  selector: 'app-postulant-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './postulant-detail.html',
  styleUrls: ['./postulant-detail.css']
})
export class PostulantDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private applicationStore = inject(ApplicationStore);

  application = signal<Application | null>(null);
  loading = signal<boolean>(true);

  private projectId: string = '';

  // Derived getters para el template
  readonly fullName = computed(() => this.application()?.fullName.getValue() ?? '');
  readonly email = computed(() => this.application()?.email.getValue() ?? '');
  readonly phone = computed(() => {
    const ph = this.application()?.phone;
    return ph ? ph.getValue() : '—';
  });
  readonly portfolio = computed(() => {
    const p = this.application()?.portfolioUrl;
    return p ? p.getValue() : '—';
  });
  readonly roleSuggested = computed(() => this.application()?.roleId ?? '');
  readonly message = computed(() => this.application()?.message.getValue() ?? '');
  readonly dateLabel = computed(() => {
    const d = this.application()?.createdAt;
    if (!d) return '';
    const dd = new Date(d);
    const day = String(dd.getDate()).padStart(2, '0');
    const month = String(dd.getMonth() + 1).padStart(2, '0');
    const year = dd.getFullYear();
    return `${day}-${month}-${year}`;
  });
  readonly initials = computed(() => {
    return this.fullName()
      .split(' ')
      .filter(p => p.length > 0)
      .slice(0, 2)
      .map(p => p[0].toUpperCase())
      .join('');
  });
  readonly statusLabel = computed(() => {
    const s = this.application()?.status;
    switch (s) {
      case ApplicationStatus.ACCEPTED: return 'Aceptado';
      case ApplicationStatus.REJECTED: return 'Rechazado';
      default: return 'Pendiente';
    }
  });
  readonly isPending = computed(() => this.application()?.status === ApplicationStatus.PENDING);

  async ngOnInit(): Promise<void> {
    const projectId = this.route.snapshot.paramMap.get('id');
    const applicationId = this.route.snapshot.paramMap.get('applicationId');

    if (!projectId || !applicationId) {
      this.router.navigate(['/projects']);
      return;
    }

    this.projectId = projectId;
    const app = await this.applicationStore.loadApplication(applicationId);
    this.application.set(app);
    this.loading.set(false);
  }

  goBack(): void {
    this.router.navigate(['/projects', this.projectId]);
  }

  async accept(): Promise<void> {
    const app = this.application();
    if (!app) return;
    if (!confirm(`¿Aceptar a ${app.fullName.getValue()}?`)) return;
    try {
      const updated = await this.applicationStore.acceptApplication(app.id);
      this.application.set(updated);
    } catch (err: any) {
      alert(err?.message ?? 'Error al aceptar al postulante');
    }
  }

  async reject(): Promise<void> {
    const app = this.application();
    if (!app) return;
    if (!confirm(`¿Rechazar a ${app.fullName.getValue()}?`)) return;
    try {
      const updated = await this.applicationStore.rejectApplication(app.id);
      this.application.set(updated);
    } catch (err: any) {
      alert(err?.message ?? 'Error al rechazar al postulante');
    }
  }
}
