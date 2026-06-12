export type EnvironmentalMetric = 'AIR_QUALITY' | 'HUMIDITY' | 'TEMPERATURE' | 'CITIZEN_PARTICIPATION';

export interface MetricCard {
  metric: EnvironmentalMetric;
  value: string;
  unit: string;
  status: 'good' | 'moderate' | 'normal' | 'active';
  icon: string;
  color: string;
}

export interface MetricTrend {
  metric: EnvironmentalMetric;
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
export const EnvironmentalMetricDisplay: Record<EnvironmentalMetric, string> = {
  'AIR_QUALITY': 'Calidad del aire',
  'HUMIDITY': 'Humedad ambiental',
  'TEMPERATURE': 'Temperatura',
  'CITIZEN_PARTICIPATION': 'Participación ciudadana'
};

export const EnvironmentalMetricUnit: Record<EnvironmentalMetric, string> = {
  'AIR_QUALITY': 'AQI',
  'HUMIDITY': '%',
  'TEMPERATURE': '°C',
  'CITIZEN_PARTICIPATION': 'reportes'
};

export const StatusLabel: Record<string, string> = {
  'good': 'Bueno',
  'moderate': 'Moderado',
  'normal': 'Normal',
  'active': 'Activo'
};
