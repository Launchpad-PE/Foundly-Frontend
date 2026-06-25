import { Injectable, signal } from '@angular/core';
import { es } from './locales/es';
import { en } from './locales/en';

export type Lang = 'es' | 'en';

const STORAGE_KEY = 'lang';

/**
 * Lightweight runtime i18n. Holds the active language as a signal and looks up
 * translations from in-memory dictionaries. Switching language is instant
 * (the impure TranslatePipe re-evaluates on the next change-detection cycle).
 */
@Injectable({ providedIn: 'root' })
export class TranslationService {
  private readonly dictionaries: Record<Lang, Record<string, string>> = { es, en };

  /** Active interface language. */
  readonly lang = signal<Lang>(this.readInitial());

  setLang(lang: Lang): void {
    this.lang.set(lang);
    localStorage.setItem(STORAGE_KEY, lang);
  }

  toggle(): void {
    this.setLang(this.lang() === 'es' ? 'en' : 'es');
  }

  /** Translates a key for the active language (falls back to Spanish, then the key). */
  t(key: string): string {
    return this.dictionaries[this.lang()][key] ?? this.dictionaries.es[key] ?? key;
  }

  private readInitial(): Lang {
    return localStorage.getItem(STORAGE_KEY) === 'en' ? 'en' : 'es';
  }
}
