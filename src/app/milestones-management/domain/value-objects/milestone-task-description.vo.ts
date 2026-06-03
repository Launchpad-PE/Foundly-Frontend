export class MilestoneTaskDescriptionVo {
  constructor(private readonly value: string) {
    const trimmed = (value ?? '').trim();
    if (trimmed.length < 5) {
      throw new Error('Milestone task description must have at least 5 characters');
    }
    if (trimmed.length > 2000) {
      throw new Error('Milestone task description cannot exceed 2000 characters');
    }
  }

  getValue(): string {
    return this.value;
  }

  equals(other: MilestoneTaskDescriptionVo): boolean {
    return this.value === other.value;
  }
}
