export class ApplicationId {
  private constructor(private readonly value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('ApplicationId cannot be empty');
    }
  }

  static fromString(value: string): ApplicationId {
    return new ApplicationId(value);
  }

  static generate(): ApplicationId {
    return new ApplicationId(crypto.randomUUID());
  }

  toString(): string {
    return this.value;
  }

  getValue(): string {
    return this.value;
  }
}
