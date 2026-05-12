export class Skill {
  constructor(private readonly name: string) {
    const cleanName = name.trim().replace(/^#/, '');
    if (!cleanName || cleanName.length < 2) {
      throw new Error('Skill must have at least 2 characters');
    }
    if (cleanName.length > 30) {
      throw new Error('Skill cannot exceed 30 characters');
    }
  }

  toString(): string {
    return `#${this.name}`;
  }

  getValue(): string {
    return this.name;
  }
}
