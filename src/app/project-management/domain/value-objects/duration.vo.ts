// domain/value-objects/duration.vo.ts
export enum DurationType {
  WEEKS = 'WEEKS',      // ← Cambiado de 'semanas'
  MONTHS = 'MONTHS',    // ← Cambiado de 'meses'
  SEMESTERS = 'SEMESTERS', // ← Cambiado de 'semestres'
  YEARS = 'YEARS'       // ← Cambiado de 'años'
}

// Para mostrar en la UI, crea un array aparte
export const DurationTypeDisplay = [
  { value: DurationType.WEEKS, label: 'Semanas' },
  { value: DurationType.MONTHS, label: 'Meses' },
  { value: DurationType.SEMESTERS, label: 'Semestres' },
  { value: DurationType.YEARS, label: 'Años' }
];

export class Duration {
  constructor(
    private readonly amount: number,
    private readonly type: DurationType
  ) {
    if (amount <= 0) {
      throw new Error('Duration amount must be positive');
    }
    if (!Object.values(DurationType).includes(type)) {
      throw new Error('Invalid duration type');
    }
  }

  toString(): string {
    // Para mostrar, usar el display label
    const display = DurationTypeDisplay.find(d => d.value === this.type);
    return `${this.amount} ${display?.label || this.type}`;
  }

  getAmount(): number {
    return this.amount;
  }

  getType(): DurationType {
    return this.type;
  }
}
