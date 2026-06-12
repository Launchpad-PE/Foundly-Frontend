// application/environmental.store.ts
import { Injectable, inject, signal, computed } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { EnvironmentalApi } from '../infrastrcuture/environmental-api';
import { DashboardData } from '../domain/model/environmental.models';

@Injectable({ providedIn: 'root' })
export class EnvironmentalStore {
  private api = inject(EnvironmentalApi);

  // State
  private projectId = signal<string | null>(null);
  private dashboardData = signal<DashboardData | null>(null);
  readonly loading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  // Computed
  readonly hasData = computed(() => this.dashboardData() !== null);
  readonly metrics = computed(() => this.dashboardData()?.metrics ?? []);
  readonly trends = computed(() => this.dashboardData()?.trends ?? []);
  readonly alerts = computed(() => this.dashboardData()?.alerts ?? []);

  // Actions
  async loadDashboard(projectId: string, days: number = 7): Promise<void> {
    // Si es el mismo proyecto y ya tenemos datos, no recargar
    if (this.projectId() === projectId && this.hasData()) {
      return;
    }

    this.projectId.set(projectId);
    this.loading.set(true);
    this.error.set(null);

    try {
      const data = await firstValueFrom(this.api.getDashboardData(projectId, days));
      this.dashboardData.set(data);
    } catch (err: any) {
      this.error.set(err.message || 'Error al cargar el dashboard');
      console.error('❌ Error loading dashboard:', err);
    } finally {
      this.loading.set(false);
    }
  }

  async refresh(): Promise<void> {
    const currentProjectId = this.projectId();
    if (currentProjectId) {
      await this.loadDashboard(currentProjectId);
    }
  }

  reset(): void {
    this.projectId.set(null);
    this.dashboardData.set(null);
    this.loading.set(false);
    this.error.set(null);
  }

  // Helpers para la UI
  getBarHeight(value: number, values: number[]): number {
    const max = Math.max(...values);
    return max > 0 ? Math.round((value / max) * 100) : 5;
  }

  getBarOpacity(value: number, values: number[]): number {
    const max = Math.max(...values);
    const min = Math.min(...values);
    const range = max - min;
    if (range === 0) return 0.8;
    return +(0.45 + ((value - min) / range) * 0.55).toFixed(2);
  }
}
