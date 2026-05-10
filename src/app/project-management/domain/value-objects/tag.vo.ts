export class Tag {
  constructor(private readonly value: string) {
    const cleanTag = value.trim().replace(/^#/, '');
    if (!cleanTag || cleanTag.length < 2) {
      throw new Error('Tag must have at least 2 characters');
    }
    if (cleanTag.length > 30) {
      throw new Error('Tag cannot exceed 30 characters');
    }
    if (!/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ]+$/.test(cleanTag)) {
      throw new Error('Tag can only contain letters and numbers');
    }
  }

  toString(): string {
    return `#${this.value}`;
  }

  getValue(): string {
    return this.value;
  }
}
