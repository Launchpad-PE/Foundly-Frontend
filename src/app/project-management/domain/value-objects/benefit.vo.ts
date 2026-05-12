export class Benefit {
  constructor(private readonly description: string) {
    if (!description || description.trim().length < 5) {
      throw new Error('Benefit description must have at least 5 characters');
    }
    if (description.length > 200) {
      throw new Error('Benefit description cannot exceed 200 characters');
    }
  }

  getDescription(): string {
    return this.description;
  }
}
