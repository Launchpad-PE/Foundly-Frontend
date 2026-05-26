export class TaskId {
  private constructor(private readonly value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('TaskId cannot be empty');
    }
  }

  static fromString(value: string): TaskId {
    return new TaskId(value);
  }

  static generate(): TaskId {
    return new TaskId(crypto.randomUUID());
  }

  toString(): string { return this.value; }
  getValue(): string { return this.value; }
}
