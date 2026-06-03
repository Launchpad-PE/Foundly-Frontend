export class Tool {
  constructor(private readonly name: string) {
    const trimmed = (name ?? '').trim();
    if (trimmed.length < 1) {
      throw new Error('Tool name cannot be empty');
    }
    if (trimmed.length > 60) {
      throw new Error('Tool name cannot exceed 60 characters');
    }
  }

  getName(): string {
    return this.name;
  }

  equals(other: Tool): boolean {
    return this.name === other.name;
  }
}
