/**
 * Bio Value Object
 * Validation rules for bio/description
 */
export class Bio {
  private value: string;

  constructor(bio: string) {
    this.value = bio;
  }

  static create(bio: string): Bio {
    const trimmed = bio.trim();

    if (trimmed.length > 500) {
      throw new Error('La biografía debe tener máximo 500 caracteres');
    }

    return new Bio(trimmed);
  }

  static createOptional(bio: string | null): Bio | null {
    if (!bio || !bio.trim()) {
      return null;
    }
    return Bio.create(bio);
  }

  getValue(): string {
    return this.value;
  }

  isEmpty(): boolean {
    return !this.value;
  }

  equals(other: Bio): boolean {
    return this.value === other.value;
  }
}
