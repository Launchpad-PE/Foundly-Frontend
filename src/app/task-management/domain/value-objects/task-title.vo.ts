export class TaskTitle {
  constructor(private readonly value: string) {
    const t = (value ?? '').trim();
    if (t.length < 3) throw new Error('Task title must have at least 3 characters');
    if (t.length > 120) throw new Error('Task title cannot exceed 120 characters');
  }
  getValue(): string { return this.value; }
}
