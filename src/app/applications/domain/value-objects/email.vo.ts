export class Email {
  private static readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  constructor(private readonly value: string) {
    const trimmed = (value ?? '').trim();
    if (!Email.EMAIL_REGEX.test(trimmed)) {
      throw new Error('Email format is invalid');
    }
  }

  getValue(): string {
    return this.value;
  }
}
