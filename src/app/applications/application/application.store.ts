// project-management/application/application.store.ts
import { Injectable, signal, computed, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { Application } from '../domain/entities/application.entity';
import { ApplicationApi } from '../infrastructure/application-api';
import { ApplicationStatus } from '../domain/enum/application-status.enum';

export interface CreateApplicationData {
  projectId: string;
  roleId: string;
  fullName: string;
  email: string;
  portfolioUrl?: string | null;
  phone?: string | null;
  cvUrl: string;
  message: string;
  acceptedTerms: boolean;
}

@Injectable({ providedIn: 'root' })
export class ApplicationStore {
  // State signals
  readonly currentApplication = signal<Application | null>(null);
  readonly projectApplications = signal<Application[]>([]);
  readonly userApplications = signal<Application[]>([]);
  readonly loading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  // Dependencies
  private applicationApi = inject(ApplicationApi);

  // Computed
  readonly pendingApplications = computed(() =>
    this.projectApplications().filter(a => a.status === ApplicationStatus.PENDING)
  );
  readonly acceptedApplications = computed(() =>
    this.projectApplications().filter(a => a.status === ApplicationStatus.ACCEPTED)
  );
  readonly rejectedApplications = computed(() =>
    this.projectApplications().filter(a => a.status === ApplicationStatus.REJECTED)
  );

  // ── Private helpers ─────────────────────────────────────────────

  private setLoading(value: boolean): void {
    this.loading.set(value);
  }

  private setError(msg: string | null): void {
    this.error.set(msg);
  }

  private clearError(): void {
    this.error.set(null);
  }

  // ── Public actions ──────────────────────────────────────────────

  /**
   * Submit a new application (postular a un proyecto).
   * Antes de crear valida que el usuario no haya postulado ya a este proyecto.
   */
  async submitApplication(data: CreateApplicationData, userId: string): Promise<Application> {
    this.setLoading(true);
    this.clearError();

    try {
      // Validar postulación duplicada
      const existing = await firstValueFrom(
        this.applicationApi.getApplicationsByProjectAndUser(data.projectId, userId)
      );
      if (existing.length > 0) {
        throw new Error('Ya has postulado a este proyecto');
      }

      const application = Application.create({
        ...data,
        userId
      });

      const saved = await firstValueFrom(this.applicationApi.createApplication(application));

      this.currentApplication.set(saved);
      this.userApplications.update(list => [saved, ...list]);

      console.log('✅ Application submitted successfully', saved);
      return saved;
    } catch (err: any) {
      const msg = err?.message || 'Error al enviar la postulación';
      this.setError(msg);
      throw err;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Load a single application by ID (para la vista de detalle del postulante).
   */
  async loadApplication(applicationId: string): Promise<Application | null> {
    this.setLoading(true);
    this.clearError();

    try {
      const application = await firstValueFrom(
        this.applicationApi.getApplication(applicationId)
      );
      this.currentApplication.set(application);
      return application;
    } catch (err: any) {
      if (err?.status === 404) {
        return null;
      }
      this.setError(err?.message || 'Error al cargar la postulación');
      return null;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Load applications received by a project (vista del emprendedor).
   */
  async loadApplicationsByProject(projectId: string): Promise<Application[]> {
    this.setLoading(true);
    this.clearError();

    try {
      const applications = await firstValueFrom(
        this.applicationApi.getApplicationsByProject(projectId)
      );
      this.projectApplications.set(applications);
      return applications;
    } catch (err: any) {
      this.setError(err?.message || 'Error al cargar postulaciones');
      return [];
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Load applications sent by a user (vista del colaborador).
   */
  async loadApplicationsByUser(userId: string): Promise<Application[]> {
    this.setLoading(true);
    this.clearError();

    try {
      const applications = await firstValueFrom(
        this.applicationApi.getApplicationsByUser(userId)
      );
      this.userApplications.set(applications);
      return applications;
    } catch (err: any) {
      this.setError(err?.message || 'Error al cargar tus postulaciones');
      return [];
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Check if a user already applied to a project (sin tocar el estado global).
   */
  async hasApplied(projectId: string, userId: string): Promise<boolean> {
    try {
      const applications = await firstValueFrom(
        this.applicationApi.getApplicationsByProjectAndUser(projectId, userId)
      );
      return applications.length > 0;
    } catch {
      return false;
    }
  }

  /**
   * Accept an application (emprendedor acepta al colaborador).
   */
  async acceptApplication(applicationId: string): Promise<Application> {
    return this.changeStatus(applicationId, ApplicationStatus.ACCEPTED);
  }

  /**
   * Reject an application.
   */
  async rejectApplication(applicationId: string): Promise<Application> {
    return this.changeStatus(applicationId, ApplicationStatus.REJECTED);
  }

  /**
   * Cambia el estado de una postulación pasando por el DOMINIO:
   *   1. Carga la entidad (cache primero, fallback al API).
   *   2. Llama al método de dominio correspondiente — el dominio valida
   *      la transición de estado (solo PENDING -> ACCEPTED/REJECTED).
   *   3. Persiste el nuevo estado en infra.
   */
  private async changeStatus(applicationId: string, status: ApplicationStatus): Promise<Application> {
    this.setLoading(true);
    this.clearError();

    try {
      // 1. Obtener la entidad (cache -> API)
      const cached =
        this.projectApplications().find(a => a.id === applicationId) ??
        this.userApplications().find(a => a.id === applicationId) ??
        (this.currentApplication()?.id === applicationId ? this.currentApplication() : null);

      const entity = cached
        ?? await firstValueFrom(this.applicationApi.getApplication(applicationId));

      // 2. Aplicar la regla de dominio (lanza si la transición no es válida)
      if (status === ApplicationStatus.ACCEPTED) {
        entity.accept();
      } else if (status === ApplicationStatus.REJECTED) {
        entity.reject();
      } else {
        throw new Error(`Unsupported status transition: ${status}`);
      }

      // 3. Persistir el nuevo estado
      const updated = await firstValueFrom(
        this.applicationApi.updateStatus(applicationId, entity.status)
      );

      // 4. Refrescar caches locales
      this.projectApplications.update(list =>
        list.map(a => a.id === applicationId ? updated : a)
      );
      this.userApplications.update(list =>
        list.map(a => a.id === applicationId ? updated : a)
      );

      if (this.currentApplication()?.id === applicationId) {
        this.currentApplication.set(updated);
      }

      return updated;
    } catch (err: any) {
      this.setError(err?.message || 'Error al actualizar el estado de la postulación');
      throw err;
    } finally {
      this.setLoading(false);
    }
  }

  reset(): void {
    this.currentApplication.set(null);
    this.projectApplications.set([]);
    this.userApplications.set([]);
    this.loading.set(false);
    this.error.set(null);
  }
}
