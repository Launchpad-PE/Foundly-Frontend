export enum EnvironmentalMetric {
  AIR_QUALITY = 'AIR_QUALITY',           // ✅ Cambiado a inglés
  HUMIDITY = 'HUMIDITY',                 // ✅ Cambiado a inglés
  TEMPERATURE = 'TEMPERATURE',           // ✅ Cambiado a inglés
  CITIZEN_PARTICIPATION = 'CITIZEN_PARTICIPATION'  // ✅ Cambiado a inglés
}

export const EnvironmentalMetricDisplay: Record<EnvironmentalMetric, string> = {
  [EnvironmentalMetric.AIR_QUALITY]: 'Calidad del aire',
  [EnvironmentalMetric.HUMIDITY]: 'Humedad ambiental',
  [EnvironmentalMetric.TEMPERATURE]: 'Temperatura',
  [EnvironmentalMetric.CITIZEN_PARTICIPATION]: 'Participación ciudadana'
};

export class EnvironmentalImpact {
  constructor(private readonly metrics: EnvironmentalMetric[]) {
    if (metrics.length === 0) {
      throw new Error('At least one environmental metric is required');
    }
  }

  getMetrics(): EnvironmentalMetric[] {
    return [...this.metrics];
  }
}
