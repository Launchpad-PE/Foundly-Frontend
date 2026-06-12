export class UserId {
  private readonly value: string;

  constructor(value: string | number) {
    // Convertir a string si viene como número
    const stringValue = value?.toString() || '';
    if (!stringValue || stringValue.trim().length === 0) {
      throw new Error('User ID cannot be empty');
    }
    this.value = stringValue;
  }

  toString(): string {
    return this.value;
  }
}
