// presentation/views/iot-dashboard/iot-dashboard.component.ts
import { Component, Input, OnInit, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EnvironmentalStore } from '../../../application/environmental.store';
import { EnvironmentalMetricDisplay, StatusLabel } from '../../../domain/model/environmental.models';
import { MetricTrend } from '../../../domain/model/environmental.models';

@Component({
  selector: 'app-iot-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './iot-dashboard.component.html',
  styleUrls: ['./iot-dashboard.component.css']
})
export class IotDashboardComponent implements OnInit, OnChanges {
  @Input() projectId!: string;
  @Input() metrics: string[] = []; // Modo legacy (sin backend)

  private store = inject(EnvironmentalStore);

  // Exponer signals del store
  readonly loading = this.store.loading;
  readonly error = this.store.error;
  readonly metricsData = this.store.metrics;
  readonly trendsData = this.store.trends;
  readonly alerts = this.store.alerts;

  readonly DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  readonly StatusLabel = StatusLabel;
  readonly EnvironmentalMetricDisplay = EnvironmentalMetricDisplay;

  // Modo legacy: si se pasan métricas directamente, usar eso
  protected get isLegacyMode(): boolean {
    return this.metrics.length > 0;
  }

  ngOnInit(): void {
    if (!this.isLegacyMode && this.projectId) {
      this.store.loadDashboard(this.projectId);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['projectId'] && !this.isLegacyMode && this.projectId) {
      this.store.loadDashboard(this.projectId);
    }
  }

  getMetricLabel(metric: string): string {
    return EnvironmentalMetricDisplay[metric as keyof typeof EnvironmentalMetricDisplay] || metric;
  }

  getMetricColor(metric: string): string {
    const trend = this.trendsData().find(t => t.metric === metric);
    if (!trend) return '#667eea';

    const colors: Record<string, string> = {
      'AIR_QUALITY': '#667eea',
      'HUMIDITY': '#3b82f6',
      'TEMPERATURE': '#10b981',
      'CITIZEN_PARTICIPATION': '#8b5cf6'
    };
    return colors[metric] || '#667eea';
  }

  getBarHeightPct(value: number, trend: MetricTrend): number {
    return this.store.getBarHeight(value, trend.values);
  }

  getBarOpacity(value: number, trend: MetricTrend): number {
    return this.store.getBarOpacity(value, trend.values);
  }

  getStatusClass(alertLevel: string): string {
    return `alert-${alertLevel}`;
  }

  refresh(): void {
    if (!this.isLegacyMode) {
      this.store.refresh();
    }
  }
}
