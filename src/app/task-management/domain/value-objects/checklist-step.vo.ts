/** Un paso del checklist que el emprendedor define para la tarea. */
export class ChecklistStep {
  constructor(
    private readonly description: string,
    private readonly done: boolean = false
  ) {
    const t = (description ?? '').trim();
    if (t.length < 2) throw new Error('Checklist step must have at least 2 characters');
    if (t.length > 200) throw new Error('Checklist step cannot exceed 200 characters');
  }
  getDescription(): string { return this.description; }
  isDone(): boolean { return this.done; }
  toggle(): ChecklistStep {
    return new ChecklistStep(this.description, !this.done);
  }
  markDone(): ChecklistStep {
    return new ChecklistStep(this.description, true);
  }
}
