/**
 * Role Value Object
 * Validation rules for professional role
 */
export class Role {
  private value: string;

  constructor(role: string) {
    this.value = role;
  }

  static create(role: string): Role {
    if (!role || !role.trim()) {
      throw new Error('El rol es requerido');
    }

    const trimmed = role.trim();

    if (trimmed.length > 100) {
      throw new Error('El rol debe tener máximo 100 caracteres');
    }

    return new Role(trimmed);
  }

  getValue(): string {
    return this.value;
  }

  isPredefined(): boolean {
    const predefinedRoles = [
      'Desarrollador Frontend',
      'Desarrollador Backend',
      'Diseñador UI/UX',
      'Project Manager',
      'Data Scientist',
      'DevOps Engineer',
      'Product Owner',
      'QA Tester',
      'Scrum Master',
      'Business Analyst',
      'Mobile Developer',
      'Full Stack Developer'
    ];
    return predefinedRoles.includes(this.value);
  }

  equals(other: Role): boolean {
    return this.value === other.value;
  }
}
