export class Tool {
  constructor(private readonly name: string) {
    const t = (name ?? '').trim();
    if (t.length < 1) throw new Error('Tool name cannot be empty');
    if (t.length > 60) throw new Error('Tool name cannot exceed 60 characters');
  }
  getName(): string { return this.name; }
}
