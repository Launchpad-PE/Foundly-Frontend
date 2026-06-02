export class MilestoneTaskDescription {
  constructor(private readonly value: string) {
    const t = (value ?? '').trim();
    if (t.length < 5) throw new Error('Milestone task description must have at least 5 characters');
    if (t.length > 2000) throw new Error('Milestone task description cannot exceed 2000 characters');
  }
  getValue(): string { return this.value; }
}
