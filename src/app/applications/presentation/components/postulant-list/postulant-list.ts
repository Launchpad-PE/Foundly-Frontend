import { Component, Input, OnInit, OnChanges, SimpleChanges, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { ApplicationStore } from '../../../application/application.store';
import { Application } from '../../../domain/entities/application.entity';
import { ApplicationStatus } from '../../../domain/enum/application-status.enum';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-postulant-list',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
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

  // ─── Estado del Modal ──────────────────────────────────────────
  modalVisible = signal<boolean>(false);
  modalAction = signal<'accept' | 'reject' | null>(null);
  selectedApp = signal<Application | null>(null);

  // Computed para el título y mensaje del modal
  modalTitle = computed(() => {
    const action = this.modalAction();
    const app = this.selectedApp();
    if (!app) return '';
    return action === 'accept'
      ? `Aceptar a ${app.fullName.getValue()}`
      : `Rechazar a ${app.fullName.getValue()}`;
  });

  modalMessage = computed(() => {
    const action = this.modalAction();
    const app = this.selectedApp();
    if (!app) return '';
    return action === 'accept'
      ? `¿Estás seguro de que quieres aceptar a <strong>${app.fullName.getValue()}</strong> para el puesto <strong>"${app.roleId}"</strong>?`
      : `¿Estás seguro de que quieres rechazar a <strong>${app.fullName.getValue()}</strong>?`;
  });

  modalButtonText = computed(() => {
    return this.modalAction() === 'accept' ? 'Aceptar' : 'Rechazar';
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

  // ─── Acciones con Modal ──────────────────────────────────────────

  accept(app: Application): void {
    this.selectedApp.set(app);
    this.modalAction.set('accept');
    this.modalVisible.set(true);
  }

  reject(app: Application): void {
    this.selectedApp.set(app);
    this.modalAction.set('reject');
    this.modalVisible.set(true);
  }

  // ─── Confirmar acción del modal ─────────────────────────────────

  async confirmAction(): Promise<void> {
    const app = this.selectedApp();
    const action = this.modalAction();

    if (!app || !action) return;

    try {
      if (action === 'accept') {
        await this.applicationStore.acceptApplication(app.id);
      } else {
        await this.applicationStore.rejectApplication(app.id);
      }
      // Recargar la lista después de la acción
      await this.applicationStore.loadApplicationsByProject(this.projectId);
      this.closeModal();
    } catch (err: any) {
      alert(err?.message ?? 'Error al procesar la acción');
    }
  }

  // ─── Cerrar modal ────────────────────────────────────────────────

  closeModal(): void {
    this.modalVisible.set(false);
    this.modalAction.set(null);
    this.selectedApp.set(null);
  }
}
