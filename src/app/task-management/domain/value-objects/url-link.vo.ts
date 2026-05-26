/** Duplicado en task-management. URL externa (Drive, Figma, etc.). */
export class UrlLink {
  constructor(private readonly value: string) {
    const t = (value ?? '').trim();
    if (t.length === 0) throw new Error('URL cannot be empty');
    try {
      const url = new URL(t);
      if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        throw new Error('URL must use http or https protocol');
      }
    } catch {
      throw new Error('URL format is invalid');
    }
  }
  getValue(): string { return this.value; }
}
