// domain/model/environmental.models.ts
export type EnvironmentalMetric = 'AIR_QUALITY' | 'HUMIDITY' | 'TEMPERATURE' | 'CITIZEN_PARTICIPATION';

export interface MetricCard {
  metric: string;  // ← Cambiar a string para que coincida con el backend
  value: string;
  unit: string;
  status: string;  // ← Cambiar a string
  icon: string;
  color: string;
}

export interface MetricTrend {
  metric: string;  // ← Cambiar a string
  values: number[];
  days: string[];
}

export interface Alert {
  level: 'red' | 'yellow' | 'green';
  message: string;
  time: string;
}

export interface DashboardData {
  metrics: MetricCard[];
  trends: MetricTrend[];
  alerts: Alert[];
}

// Display helpers
export const EnvironmentalMetricDisplay: Record<string, string> = {
  'AIR_QUALITY': 'Calidad del aire',
  'HUMIDITY': 'Humedad ambiental',
  'TEMPERATURE': 'Temperatura',
  'CITIZEN_PARTICIPATION': 'Participación ciudadana'
};

export const StatusLabel: Record<string, string> = {
  'good': 'Bueno',
  'moderate': 'Moderado',
  'normal': 'Normal',
  'active': 'Activo',
  'bad': 'Peligroso'
};
