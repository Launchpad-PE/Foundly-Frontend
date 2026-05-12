export class Summary {
  constructor(private readonly value: string) {
    if (!value || value.trim().length < 10) {
      throw new Error('Summary must have at least 10 characters');
    }
    if (value.length > 500) {
      throw new Error('Summary cannot exceed 500 characters');
    }
  }

  getValue(): string {
    return this.value;
  }
}
