export class ChecklistStep {
  constructor(
    private readonly description: string,
    private readonly done: boolean = false
  ) {
    const trimmed = (description ?? '').trim();
    if (trimmed.length < 2) {
      throw new Error('Checklist step must have at least 2 characters');
    }
    if (trimmed.length > 200) {
      throw new Error('Checklist step cannot exceed 200 characters');
    }
  }

  getDescription(): string {
    return this.description;
  }

  isDone(): boolean {
    return this.done;
  }

  toggle(): ChecklistStep {
    return new ChecklistStep(this.description, !this.done);
  }

  markDone(): ChecklistStep {
    return new ChecklistStep(this.description, true);
  }

  markPending(): ChecklistStep {
    return new ChecklistStep(this.description, false);
  }

  equals(other: ChecklistStep): boolean {
    return this.description === other.description && this.done === other.done;
  }
}
