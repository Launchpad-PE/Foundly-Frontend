export class MilestoneDescription {
  constructor(private readonly value: string) {
    const trimmed = (value ?? '').trim();
    if (trimmed.length < 5) {
      throw new Error('Milestone description must have at least 5 characters');
    }
    if (trimmed.length > 2000) {
      throw new Error('Milestone description cannot exceed 2000 characters');
    }
  }

  getValue(): string {
    return this.value;
  }

  equals(other: MilestoneDescription): boolean {
    return this.value === other.value;
  }
}
