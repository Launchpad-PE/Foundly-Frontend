import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import {
  Alert,
  DashboardData,
  EnvironmentalMetric,
  MetricCard,
  MetricTrend
} from '../domain/model/environmental.models';


// Datos mock (simulando respuesta de API)
const MOCK_METRICS: EnvironmentalMetric[] = [
  'AIR_QUALITY', 'HUMIDITY', 'TEMPERATURE', 'CITIZEN_PARTICIPATION'
];

const MOCK_METRIC_VALUES: Record<EnvironmentalMetric, { value: number; unit: string; status: string; trend: number[] }> = {
  'AIR_QUALITY': { value: 72, unit: 'AQI', status: 'good', trend: [45, 55, 60, 72, 68, 75, 72] },
  'HUMIDITY': { value: 68, unit: '%', status: 'moderate', trend: [70, 65, 72, 68, 75, 63, 68] },
  'TEMPERATURE': { value: 23, unit: '°C', status: 'normal', trend: [20, 22, 25, 23, 24, 21, 23] },
  'CITIZEN_PARTICIPATION': { value: 142, unit: 'reportes', status: 'active', trend: [90, 110, 125, 130, 138, 140, 142] }
};

const MOCK_ALERTS: Alert[] = [
  { level: 'red', message: 'AQI superó nivel 100 en zonas norte', time: 'Hoy, 10:32 am' },
  { level: 'yellow', message: 'Humedad fuera del rango óptimo (>75%)', time: 'Ayer, 6:15 pm' },
  { level: 'green', message: 'Temperatura volvió a rango normal', time: 'Ayer, 2:00 pm' }
];

const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

@Injectable({ providedIn: 'root' })
export class EnvironmentalApi {
  private http = inject(HttpClient);
  private baseUrl = '/api/v1/environmental'; // ← Apunta al backend real

  async getDashboardData(projectId: string, days: number = 7): Promise<DashboardData> {
    console.log('📡 Llamando al backend:', `${this.baseUrl}/projects/${projectId}/dashboard?days=${days}`);

    const response = await firstValueFrom(
      this.http.get<DashboardData>(`${this.baseUrl}/projects/${projectId}/dashboard`, {
        params: { days: days.toString() }
      })
    );

    console.log('📡 Respuesta del backend:', response);
    return response;
  }

  async getMetrics(projectId: string): Promise<EnvironmentalMetric[]> {
    console.log('📡 Llamando al backend:', `${this.baseUrl}/projects/${projectId}/metrics`);

    const response = await firstValueFrom(
      this.http.get<EnvironmentalMetric[]>(`${this.baseUrl}/projects/${projectId}/metrics`)
    );

    console.log('📡 Respuesta del backend:', response);
    return response;
  }
}
