// application/environmental.store.ts
import { Injectable, inject, signal, computed } from '@angular/core';
import { EnvironmentalApi } from '../infrastrcuture/environmental-api';
import { DashboardData } from '../domain/model/environmental.models';

@Injectable({ providedIn: 'root' })
export class EnvironmentalStore {
  private api = inject(EnvironmentalApi);

  private projectId = signal<string | null>(null);
  private dashboardData = signal<DashboardData | null>(null);
  readonly loading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  readonly metrics = computed(() => this.dashboardData()?.metrics ?? []);
  readonly trends = computed(() => this.dashboardData()?.trends ?? []);
  readonly alerts = computed(() => this.dashboardData()?.alerts ?? []);

  async loadDashboard(projectId: string, days: number = 7): Promise<void> {
    if (this.projectId() === projectId && this.dashboardData()) {
      console.log('📦 Usando datos en caché');
      return;
    }

    this.projectId.set(projectId);
    this.loading.set(true);
    this.error.set(null);

    try {
      const data = await this.api.getDashboardData(projectId, days);
      this.dashboardData.set(data);
      console.log('✅ Dashboard cargado correctamente');
    } catch (err: any) {
      this.error.set(err.message || 'Error al cargar el dashboard');
      console.error('❌ Error:', err);
    } finally {
      this.loading.set(false);
    }
  }

  refresh(): void {
    const currentId = this.projectId();
    if (currentId) {
      this.loadDashboard(currentId);
    }
  }

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
