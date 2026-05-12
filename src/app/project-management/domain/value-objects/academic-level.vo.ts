export class AcademicLevel {
  constructor(private readonly value: string | null) {
    if (value !== null) {
      const validLevels = ['Pregrado', 'Postgrado', 'Doctorado', 'Técnico', 'Autodidacta'];
      if (!validLevels.includes(value)) {
        throw new Error(`Academic level must be one of: ${validLevels.join(', ')}`);
      }
    }
  }

  getValue(): string | null {
    return this.value;
  }
}
