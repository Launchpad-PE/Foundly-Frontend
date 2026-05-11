import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EnvironmentalMetric } from '../../../../project-management/domain/value-objects/environmental-impact.vo';

interface MetricConfig {
  value: string;
  unit: string;
  status: string;
  statusClass: string;
  trend: number[];
  color: string;
  icon: string;
}

interface Alert {
  level: 'red' | 'yellow' | 'green';
  message: string;
  time: string;
}

const METRIC_CONFIG: Record<EnvironmentalMetric, MetricConfig> = {
  [EnvironmentalMetric.AIR_QUALITY]: {
    value: '72', unit: 'AQI', status: 'Bueno', statusClass: 'good',
    trend: [45, 55, 60, 72, 68, 75, 72], color: '#667eea', icon: '🌬️'
  },
  [EnvironmentalMetric.HUMIDITY]: {
    value: '68', unit: '%', status: 'Moderado', statusClass: 'moderate',
    trend: [70, 65, 72, 68, 75, 63, 68], color: '#3b82f6', icon: '💧'
  },
  [EnvironmentalMetric.TEMPERATURE]: {
    value: '23', unit: '°C', status: 'Normal', statusClass: 'normal',
    trend: [20, 22, 25, 23, 24, 21, 23], color: '#10b981', icon: '🌡️'
  },
  [EnvironmentalMetric.CITIZEN_PARTICIPATION]: {
    value: '142', unit: 'reportes', status: 'Activo', statusClass: 'active',
    trend: [90, 110, 125, 130, 138, 140, 142], color: '#8b5cf6', icon: '👥'
  }
};

const STATIC_ALERTS: Alert[] = [
  { level: 'red',    message: 'AQI superó nivel 100 en zonas norte',   time: 'Hoy, 10:32 am' },
  { level: 'yellow', message: 'Humedad fuera del rango óptimo (>75%)', time: 'Ayer, 6:15 pm' },
  { level: 'green',  message: 'Temperatura volvió a rango normal',     time: 'Ayer, 2:00 pm' }
];

const TREND_CAPABLE = new Set([
  EnvironmentalMetric.AIR_QUALITY,
  EnvironmentalMetric.TEMPERATURE,
]);

const TREND_LABELS: Record<EnvironmentalMetric, string> = {
  [EnvironmentalMetric.AIR_QUALITY]: 'Calidad del aire (AQI)',
  [EnvironmentalMetric.HUMIDITY]: 'Humedad ambiental (%)',
  [EnvironmentalMetric.TEMPERATURE]: 'Temperatura °C',
  [EnvironmentalMetric.CITIZEN_PARTICIPATION]: 'Participación ciudadana',
};

@Component({
  selector: 'app-iot-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './iot-dashboard.html',
  styleUrls: ['./iot-dashboard.css']
})
export class IotDashboardComponent {
  @Input() metrics: EnvironmentalMetric[] = [];

  readonly DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  readonly alerts = STATIC_ALERTS;

  get cards() {
    return this.metrics.map(m => ({ metric: m, ...METRIC_CONFIG[m] }));
  }

  get trendCards() {
    return this.cards.filter(c => TREND_CAPABLE.has(c.metric));
  }

  getBarHeightPct(value: number, trend: number[]): number {
    const max = Math.max(...trend);
    return max > 0 ? Math.round((value / max) * 100) : 5;
  }

  getBarOpacity(value: number, trend: number[]): number {
    const max = Math.max(...trend);
    const min = Math.min(...trend);
    const range = max - min;
    if (range === 0) return 0.8;
    return +(0.45 + ((value - min) / range) * 0.55).toFixed(2);
  }

  getTrendLabel(metric: EnvironmentalMetric): string {
    return TREND_LABELS[metric];
  }
}
