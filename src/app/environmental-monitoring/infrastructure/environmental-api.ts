// infrastructure/environmental-api.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { DashboardData, EnvironmentalMetric } from '../domain/model/environmental.models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class EnvironmentalApi {
  private http = inject(HttpClient);
  private baseUrl = environment.platformProviderApiBaseUrl;

  async getDashboardData(projectId: string, days: number = 7): Promise<DashboardData> {
    const url = `${this.baseUrl}${environment.platformEnvironmental}/projects/${projectId}/dashboard`;
    const params = { days: days.toString() };

    console.log('📡 [API] ===== INICIO LLAMADA =====');
    console.log('📡 [API] URL completa:', url);
    console.log('📡 [API] Params:', params);

    try {
      const response = await firstValueFrom(
        this.http.get<DashboardData>(url, { params })
      );

      console.log('📡 [API] ✅ Respuesta RAW:', response);
      console.log('📡 [API] metrics:', response?.metrics);
      console.log('📡 [API] trends:', response?.trends);
      console.log('📡 [API] alerts:', response?.alerts);

      // Validar y normalizar la respuesta
      if (!response) {
        console.warn('📡 [API] ⚠️ Respuesta vacía');
        return { metrics: [], trends: [], alerts: [] };
      }

      const normalizedResponse = {
        metrics: Array.isArray(response.metrics) ? response.metrics : [],
        trends: Array.isArray(response.trends) ? response.trends : [],
        alerts: Array.isArray(response.alerts) ? response.alerts : []
      };

      console.log('📡 [API] 📦 Respuesta normalizada:', normalizedResponse);
      console.log('📡 [API] ===== FIN LLAMADA =====');
      return normalizedResponse;
    } catch (error) {
      console.error('📡 [API] ❌ Error en petición:', error);
      if (error instanceof HttpErrorResponse) {
        console.error('📡 [API] Status:', error.status);
        console.error('📡 [API] StatusText:', error.statusText);
        console.error('📡 [API] Error details:', error.error);
      }
      throw error;
    }
  }

  async getMetrics(projectId: string): Promise<EnvironmentalMetric[]> {
    console.log('📡 [API] getMetrics llamado con projectId:', projectId);
    try {
      const response = await firstValueFrom(
        this.http.get<EnvironmentalMetric[]>(`${this.baseUrl}/projects/${projectId}/metrics`)
      );
      console.log('📡 [API] getMetrics response:', response);
      return response || [];
    } catch (error) {
      console.error('📡 [API] Error en getMetrics:', error);
      return [];
    }
  }
}
