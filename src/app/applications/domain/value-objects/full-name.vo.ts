export class FullName {
  constructor(private readonly value: string) {
    const trimmed = (value ?? '').trim();
    if (trimmed.length < 3) {
      throw new Error('Full name must have at least 3 characters');
    }
    if (trimmed.length > 80) {
      throw new Error('Full name cannot exceed 80 characters');
    }
  }

  getValue(): string {
    return this.value;
  }
}
