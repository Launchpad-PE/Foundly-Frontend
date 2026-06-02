export class MilestoneDescription {
  constructor(private readonly value: string) {
    const t = (value ?? '').trim();
    if (t.length < 5) throw new Error('Milestone description must have at least 5 characters');
    if (t.length > 2000) throw new Error('Milestone description cannot exceed 2000 characters');
  }
  getValue(): string { return this.value; }
}
