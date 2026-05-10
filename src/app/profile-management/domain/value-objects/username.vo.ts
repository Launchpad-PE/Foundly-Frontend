/**
 * Username Value Object
 * Validation rules for username
 */
export class Username {
  private value: string;

  constructor(username: string) {
    this.value = username;
  }

  static create(username: string): Username {
    if (!username || !username.trim()) {
      throw new Error('Username es requerido');
    }

    const trimmed = username.trim();

    if (trimmed.length < 3) {
      throw new Error('Username debe tener al menos 3 caracteres');
    }

    if (trimmed.length > 50) {
      throw new Error('Username debe tener máximo 50 caracteres');
    }

    // Solo letras, números, guiones y guiones bajos
    const usernameRegex = /^[a-zA-Z0-9_-]+$/;
    if (!usernameRegex.test(trimmed)) {
      throw new Error('Username solo puede contener letras, números, guiones y guiones bajos');
    }

    return new Username(trimmed);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: Username): boolean {
    return this.value === other.value;
  }
}
