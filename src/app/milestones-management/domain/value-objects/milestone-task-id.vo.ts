export class MilestoneTaskId {
  private constructor(private readonly value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('MilestoneTaskId cannot be empty');
    }
  }

  static fromString(value: string): MilestoneTaskId {
    return new MilestoneTaskId(value);
  }

  static generate(): MilestoneTaskId {
    return new MilestoneTaskId(crypto.randomUUID());
  }

  toString(): string {
    return this.value;
  }

  getValue(): string {
    return this.value;
  }

  equals(other: MilestoneTaskId): boolean {
    return this.value === other.value;
  }
}
