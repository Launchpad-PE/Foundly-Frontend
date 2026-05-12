export class ProjectName {
  constructor(private readonly value: string) {
    if (!value || value.trim().length < 3) {
      throw new Error('Project name must have at least 3 characters');
    }
    if (value.length > 100) {
      throw new Error('Project name cannot exceed 100 characters');
    }
  }

  getValue(): string {
    return this.value;
  }
}
