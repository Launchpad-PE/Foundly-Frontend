// application/environmental.store.ts
import { Injectable, inject, signal, computed } from '@angular/core';
import { DashboardData } from '../domain/model/environmental.models';
import { EnvironmentalApi } from '../infrastructure/environmental-api';

@Injectable({ providedIn: 'root' })
export class EnvironmentalStore {
  private api = inject(EnvironmentalApi);

  private dashboardData = signal<DashboardData | null>(null);
  readonly loading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  readonly metrics = computed(() => {
    const data = this.dashboardData();
    console.log('🔄 [STORE] metrics computed, data exists:', !!data);
    return data?.metrics ?? [];
  });

  readonly trends = computed(() => {
    const data = this.dashboardData();
    return data?.trends ?? [];
  });

  readonly alerts = computed(() => {
    const data = this.dashboardData();
    return data?.alerts ?? [];
  });

  async loadDashboard(projectId: string, days: number = 7): Promise<void> {
    console.log('🔄 [STORE] loadDashboard - projectId:', projectId);

    if (!projectId || projectId.trim() === '') {
      console.error('❌ [STORE] projectId inválido');
      this.error.set('ID de proyecto inválido');
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    try {
      const data = await this.api.getDashboardData(projectId, days);
      console.log('✅ [STORE] Datos recibidos:', data);
      console.log('✅ [STORE] Metrics:', data.metrics?.length);
      console.log('✅ [STORE] Trends:', data.trends?.length);
      console.log('✅ [STORE] Alerts:', data.alerts?.length);

      // Crear nuevo objeto para asegurar reactividad
      const newDashboardData: DashboardData = {
        metrics: [...(data.metrics || [])],
        trends: [...(data.trends || [])],
        alerts: [...(data.alerts || [])]
      };

      this.dashboardData.set(newDashboardData);

      console.log('✅ [STORE] dashboardData actualizado, metrics count:', this.metrics().length);
    } catch (err: any) {
      console.error('❌ [STORE] Error:', err);
      this.error.set(err.message || 'Error al cargar el dashboard');
      this.dashboardData.set({ metrics: [], trends: [], alerts: [] });
    } finally {
      this.loading.set(false);
    }
  }

  refresh(projectId: string): void {
    console.log('🔄 [STORE] refresh llamado con projectId:', projectId);
    if (projectId) {
      this.loadDashboard(projectId);
    }
  }

  getBarHeight(value: number, values: number[]): number {
    const max = Math.max(...values);
    return max > 0 ? (value / max) * 100 : 5;
  }

  getBarOpacity(value: number, values: number[]): number {
    const max = Math.max(...values);
    const min = Math.min(...values);
    const range = max - min;
    if (range === 0) return 0.8;
    return 0.45 + ((value - min) / range) * 0.55;
  }
}
