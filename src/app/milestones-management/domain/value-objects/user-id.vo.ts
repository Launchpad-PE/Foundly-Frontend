/** Duplicado en task-management para mantener el BC desacoplado del dominio de iam. */
export class UserId {
  constructor(private readonly value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('User ID cannot be empty');
    }
  }
  toString(): string { return this.value; }
  getValue(): string { return this.value; }
}
