import { Component, Input, OnInit, OnChanges, SimpleChanges, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { ApplicationStore } from '../../../application/application.store';
import { Application } from '../../../domain/entities/application.entity';
import { ApplicationStatus } from '../../../domain/enum/application-status.enum';

@Component({
  selector: 'app-postulant-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './postulant-list.html',
  styleUrls: ['./postulant-list.css']
})
export class PostulantListComponent implements OnInit, OnChanges {
  /** ID del proyecto cuyas postulaciones se listan */
  @Input() projectId: string = '';

  /** Lista de roles del proyecto, usada para el dropdown de filtro */
  @Input() availableRoles: string[] = [];

  private applicationStore = inject(ApplicationStore);
  private router = inject(Router);

  // Estado local
  selectedRole = signal<string>(''); // '' = todos
  applications = this.applicationStore.projectApplications;
  loading = this.applicationStore.loading;
  error = this.applicationStore.error;

  // Filtrado client-side por puesto
  readonly filteredApplications = computed(() => {
    const role = this.selectedRole();
    const apps = this.applications();
    if (!role) return apps;
    return apps.filter(a => a.roleId === role);
  });

  ngOnInit(): void {
    if (this.projectId) {
      this.applicationStore.loadApplicationsByProject(this.projectId);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['projectId'] && this.projectId) {
      this.applicationStore.loadApplicationsByProject(this.projectId);
    }
  }

  /** Iniciales para el avatar circular */
  getInitials(fullName: string): string {
    return fullName
      .split(' ')
      .filter(p => p.length > 0)
      .slice(0, 2)
      .map(p => p[0].toUpperCase())
      .join('');
  }

  /** Fecha formateada DD-MM-YYYY como en el mockup */
  formatDate(date: Date): string {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  }

  isPending(app: Application): boolean {
    return app.status === ApplicationStatus.PENDING;
  }

  isAccepted(app: Application): boolean {
    return app.status === ApplicationStatus.ACCEPTED;
  }

  isRejected(app: Application): boolean {
    return app.status === ApplicationStatus.REJECTED;
  }

  statusLabel(app: Application): string {
    switch (app.status) {
      case ApplicationStatus.ACCEPTED: return 'Aceptado';
      case ApplicationStatus.REJECTED: return 'Rechazado';
      default: return 'Pendiente';
    }
  }

  viewPostulant(app: Application): void {
    this.router.navigate(['/projects', this.projectId, 'postulantes', app.id]);
  }

  async accept(app: Application): Promise<void> {
    if (!confirm(`¿Aceptar a ${app.fullName.getValue()} para el puesto "${app.roleId}"?`)) return;
    try {
      await this.applicationStore.acceptApplication(app.id);
    } catch (err: any) {
      alert(err?.message ?? 'Error al aceptar al postulante');
    }
  }

  async reject(app: Application): Promise<void> {
    if (!confirm(`¿Rechazar a ${app.fullName.getValue()}?`)) return;
    try {
      await this.applicationStore.rejectApplication(app.id);
    } catch (err: any) {
      alert(err?.message ?? 'Error al rechazar al postulante');
    }
  }

}
