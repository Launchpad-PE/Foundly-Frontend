// presentation/views/iot-dashboard/iot-dashboard.component.ts
import { Component, Input, OnInit, OnChanges, SimpleChanges, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EnvironmentalStore } from '../../../application/environmental.store';
import { EnvironmentalMetricDisplay, StatusLabel } from '../../../domain/model/environmental.models';
import { MetricTrend } from '../../../domain/model/environmental.models';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-iot-dashboard',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './iot-dashboard.component.html',
  styleUrls: ['./iot-dashboard.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IotDashboardComponent implements OnInit, OnChanges {
  @Input() projectId!: string;
  @Input() metrics: string[] = [];

  private store = inject(EnvironmentalStore);
  private cdr = inject(ChangeDetectorRef);

  readonly loading = this.store.loading;
  readonly error = this.store.error;
  readonly metricsData = this.store.metrics;
  readonly trendsData = this.store.trends;
  readonly alerts = this.store.alerts;

  readonly DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  readonly StatusLabel = StatusLabel;

  protected get shouldUseBackend(): boolean {
    return !!this.projectId && this.projectId.length > 0;
  }

  ngOnInit(): void {
    console.log('🔍 [IOT] ngOnInit - projectId:', this.projectId);
    console.log('🔍 [IOT] metrics input:', this.metrics);

    if (this.shouldUseBackend) {
      console.log('🔍 [IOT] Cargando dashboard desde backend');
      this.store.loadDashboard(this.projectId).then(() => {
        console.log('🔍 [IOT] Datos cargados, metricsData:', this.metricsData());
        console.log('🔍 [IOT] trendsData:', this.trendsData());
        this.cdr.detectChanges();
      });
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('🔍 [IOT] ngOnChanges:', changes);

    if (changes['projectId'] && this.shouldUseBackend) {
      console.log('🔍 [IOT] projectId cambió de', changes['projectId'].previousValue, 'a', changes['projectId'].currentValue);
      this.store.loadDashboard(this.projectId).then(() => {
        this.cdr.detectChanges();
      });
    }
  }

  getMetricLabel(metric: string): string {
    return EnvironmentalMetricDisplay[metric] || metric;
  }

  getMetricColor(metric: string): string {
    const colors: Record<string, string> = {
      'AIR_QUALITY': '#667eea',
      'HUMIDITY': '#3b82f6',
      'TEMPERATURE': '#10b981',
      'CITIZEN_PARTICIPATION': '#8b5cf6'
    };
    return colors[metric] || '#667eea';
  }

  getBarHeightPct(value: number, trend: MetricTrend): number {
    const max = Math.max(...trend.values);
    return max > 0 ? (value / max) * 100 : 5;
  }

  getBarOpacity(value: number, trend: MetricTrend): number {
    const max = Math.max(...trend.values);
    const min = Math.min(...trend.values);
    const range = max - min;
    if (range === 0) return 0.8;
    return 0.45 + ((value - min) / range) * 0.55;
  }

  refresh(): void {
    console.log('🔍 [IOT] refresh manual llamado');
    if (this.shouldUseBackend) {
      this.store.loadDashboard(this.projectId).then(() => {
        this.cdr.detectChanges();
      });
    }
  }

  getStatusText(status: string): string {
    const statusMap: Record<string, string> = {
      'good': 'Óptimo',
      'moderate': 'Moderado',
      'normal': 'Normal',
      'active': 'Activo',
      'bad': 'Crítico'
    };
    return statusMap[status] || status;
  }
  getUnitFromMetric(metric: string): string {
    const units: Record<string, string> = {
      'AIR_QUALITY': 'AQI',
      'HUMIDITY': '%',
      'TEMPERATURE': '°C',
      'CITIZEN_PARTICIPATION': 'rep'
    };
    return units[metric] || '';
  }

  getTrendAverage(values: number[]): string {
    if (!values || values.length === 0) return '0';
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    return avg.toFixed(0);
  }

  getMaxValue(values: number[]): number {
    return Math.max(...values);
  }

  getTrendIcon(metric: string): string {
    const icons: Record<string, string> = {
      'AIR_QUALITY': '🌿',
      'HUMIDITY': '💧',
      'TEMPERATURE': '🌡️',
      'CITIZEN_PARTICIPATION': '👥'
    };
    return icons[metric] || '📊';
  }
}
