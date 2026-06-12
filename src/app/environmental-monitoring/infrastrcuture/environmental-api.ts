import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
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
  private useMock = true; // Cambiar a false cuando el backend esté listo
  private baseUrl = '/api/environmental';

  constructor(private http: HttpClient) {}

  getMetrics(projectId: string): Observable<EnvironmentalMetric[]> {
    if (this.useMock) {
      return of(MOCK_METRICS).pipe(delay(300));
    }
    return this.http.get<EnvironmentalMetric[]>(`${this.baseUrl}/projects/${projectId}/metrics`);
  }

  getDashboardData(projectId: string, days: number = 7): Observable<DashboardData> {
    if (this.useMock) {
      // Construir métricas
      const metrics: MetricCard[] = MOCK_METRICS.map(metric => {
        const data = MOCK_METRIC_VALUES[metric];
        return {
          metric,
          value: data.value.toString(),
          unit: data.unit,
          status: data.status as 'good' | 'moderate' | 'normal' | 'active',
          icon: this.getIconForMetric(metric),
          color: this.getColorForMetric(metric)
        };
      });

      const trends: MetricTrend[] = MOCK_METRICS.map(metric => ({
        metric,
        values: MOCK_METRIC_VALUES[metric].trend,
        days: DAYS
      }));

      return of({ metrics, trends, alerts: MOCK_ALERTS }).pipe(delay(500));
    }

    return this.http.get<DashboardData>(`${this.baseUrl}/projects/${projectId}/dashboard`, {
      params: { days: days.toString() }
    });
  }

  private getIconForMetric(metric: EnvironmentalMetric): string {
    const icons: Record<EnvironmentalMetric, string> = {
      'AIR_QUALITY': '🌬️',
      'HUMIDITY': '💧',
      'TEMPERATURE': '🌡️',
      'CITIZEN_PARTICIPATION': '👥'
    };
    return icons[metric];
  }

  private getColorForMetric(metric: EnvironmentalMetric): string {
    const colors: Record<EnvironmentalMetric, string> = {
      'AIR_QUALITY': '#667eea',
      'HUMIDITY': '#3b82f6',
      'TEMPERATURE': '#10b981',
      'CITIZEN_PARTICIPATION': '#8b5cf6'
    };
    return colors[metric];
  }
}
