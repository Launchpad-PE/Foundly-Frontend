export class Tag {
  private readonly cleanValue: string;

  constructor(value: string) {
    // Normalize: trim, collapse spaces → single space, allow letters/numbers/spaces/hyphens
    const normalized = value.trim().replace(/^#/, '').replace(/\s+/g, ' ');

    if (!normalized || normalized.length < 2) {
      throw new Error('La etiqueta debe tener al menos 2 caracteres');
    }
    if (normalized.length > 40) {
      throw new Error('La etiqueta no puede superar los 40 caracteres');
    }
    if (!/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-]+$/.test(normalized)) {
      throw new Error('La etiqueta solo puede contener letras, números, espacios y guiones');
    }

    this.cleanValue = normalized;
  }

  toString(): string {
    return `#${this.cleanValue}`;
  }

  getValue(): string {
    return this.cleanValue;
  }
}
