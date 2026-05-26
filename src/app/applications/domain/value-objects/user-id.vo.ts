/**
 * Identifier referencing a user from the iam bounded context.
 * Duplicated here on purpose so the `applications` context stays decoupled.
 */
export class UserId {
  constructor(private readonly value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('User ID cannot be empty');
    }
  }

  toString(): string {
    return this.value;
  }

  getValue(): string {
    return this.value;
  }
}
