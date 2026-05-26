export class PresentationMessage {
  constructor(private readonly value: string) {
    const trimmed = (value ?? '').trim();
    if (trimmed.length < 10) {
      throw new Error('Presentation message must have at least 10 characters');
    }
    if (trimmed.length > 1000) {
      throw new Error('Presentation message cannot exceed 1000 characters');
    }
  }

  getValue(): string {
    return this.value;
  }
}
