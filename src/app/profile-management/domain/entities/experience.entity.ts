/**
 * Experience Entity
 * Represents a work or educational experience
 */
export class Experience {
  id: string | null;
  title: string;      // Cargo/Puesto
  company: string;    // Empresa/Institución
  period: string;     // Tiempo (ej: "Ene 2020 - Presente")
  description: string | null;
  current: boolean;
  startDate: Date | null;
  endDate: Date | null;
  createdAt: Date;
  updatedAt: Date;

  constructor({
                id = null as string | null,
                title = '',
                company = '',
                period = '',
                description = null as string | null,
                current = false,
                startDate = null as Date | null,
                endDate = null as Date | null,
                createdAt = null as string | null,
                updatedAt = null as string | null,
              } = {}) {
    this.id = id;
    this.title = title;
    this.company = company;
    this.period = period;
    this.description = description;
    this.current = current;
    this.startDate = startDate;
    this.endDate = endDate;
    this.createdAt = createdAt ? new Date(createdAt) : new Date();
    this.updatedAt = updatedAt ? new Date(updatedAt) : new Date();
  }

  // Business logic
  isCurrentJob(): boolean {
    return this.current;
  }

  getFormattedPeriod(): string {
    if (this.period) return this.period;

    if (this.startDate && this.endDate) {
      return `${this.startDate.getFullYear()} - ${this.endDate.getFullYear()}`;
    }

    if (this.startDate && this.current) {
      return `${this.startDate.getFullYear()} - Presente`;
    }

    return '';
  }

  // Validation
  validate(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.title.trim()) {
      errors.push('El título es requerido');
    }

    if (!this.company.trim()) {
      errors.push('La empresa es requerida');
    }

    return { isValid: errors.length === 0, errors };
  }

  // Update methods
  updateTitle(newTitle: string): void {
    this.title = newTitle;
    this.updatedAt = new Date();
  }

  updateCompany(newCompany: string): void {
    this.company = newCompany;
    this.updatedAt = new Date();
  }

  updatePeriod(newPeriod: string): void {
    this.period = newPeriod;
    this.updatedAt = new Date();
  }
}
