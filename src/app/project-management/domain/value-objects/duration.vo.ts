export enum DurationType {
  WEEKS = 'semanas',
  MONTHS = 'meses',
  SEMESTERS = 'semestres',
  YEARS = 'años'
}

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
    return `${this.amount} ${this.type}`;
  }

  getAmount(): number {
    return this.amount;
  }

  getType(): DurationType {
    return this.type;
  }
}
