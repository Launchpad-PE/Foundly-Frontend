export class Attachments {
  constructor(private readonly value: string) {
    const trimmed = (value ?? '').trim();
    if (trimmed.length === 0) {
      throw new Error('URL cannot be empty');
    }
    try {
      const url = new URL(trimmed);
      if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        throw new Error('URL must use http or https protocol');
      }
    } catch {
      throw new Error('URL format is invalid');
    }
  }

  getValue(): string {
    return this.value;
  }

  equals(other: Attachments): boolean {
    return this.value === other.value;
  }
}
