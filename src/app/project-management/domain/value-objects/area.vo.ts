export class Area {
  constructor(private readonly value: string) {
    const validAreas = ['Tecnología', 'Ciencia', 'Arte', 'Educación', 'Social', 'Ambiental'];
    if (!validAreas.includes(value)) {
      throw new Error(`Area must be one of: ${validAreas.join(', ')}`);
    }
  }

  getValue(): string {
    return this.value;
  }
}
