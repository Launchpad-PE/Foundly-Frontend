export class MilestoneId {
  private constructor(private readonly value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('MilestoneId cannot be empty');
    }
  }

  static fromString(value: string): MilestoneId {
    return new MilestoneId(value);
  }

  static generate(): MilestoneId {
    return new MilestoneId(crypto.randomUUID());
  }

  toString(): string { return this.value; }
  getValue(): string { return this.value; }
}
