export class ProjectId {
  private constructor(private readonly value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('Project ID cannot be empty');
    }
  }
  static fromString(value: string): ProjectId { return new ProjectId(value); }
  toString(): string { return this.value; }
  getValue(): string { return this.value; }
}
