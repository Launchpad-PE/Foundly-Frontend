// domain/value-objects/environmental-impact.vo.ts
export enum EnvironmentalMetric {
  AIR_QUALITY = 'Calidad del aire',
  HUMIDITY = 'Humedad ambiental',
  TEMPERATURE = 'Temperatura',
  CITIZEN_PARTICIPATION = 'Participación ciudadana'
}

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
