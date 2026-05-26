export class PhoneNumber {
  private static readonly DIGITS_ONLY = /^\d{6,15}$/;

  constructor(private readonly value: string) {
    const digits = (value ?? '').replace(/\D/g, '');
    if (!PhoneNumber.DIGITS_ONLY.test(digits)) {
      throw new Error('Phone number must contain between 6 and 15 digits');
    }
  }

  getValue(): string {
    return this.value;
  }
}
