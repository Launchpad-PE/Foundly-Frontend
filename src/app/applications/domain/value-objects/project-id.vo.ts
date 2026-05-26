/**
 * Identifier referencing a project from the project-management bounded context.
 * Duplicated here on purpose so the `applications` context stays decoupled
 * from `project-management`'s domain.
 */
export class ProjectId {
  private constructor(private readonly value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('Project ID cannot be empty');
    }
  }

  static fromString(value: string): ProjectId {
    return new ProjectId(value);
  }

  toString(): string {
    return this.value;
  }

  getValue(): string {
    return this.value;
  }

  equals(other: ProjectId): boolean {
    return this.value === other.value;
  }
}
