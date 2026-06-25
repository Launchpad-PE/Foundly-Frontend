import { Pipe, PipeTransform, inject } from '@angular/core';
import { TranslationService } from './translation.service';

/**
 * Translates a key with the active language: {{ 'nav.home' | translate }}.
 *
 * <p>Impure so it re-evaluates each change-detection cycle; when the language
 * signal changes (e.g. from the switcher) the UI updates instantly.</p>
 */
@Pipe({ name: 'translate', standalone: true, pure: false })
export class TranslatePipe implements PipeTransform {
  private readonly i18n = inject(TranslationService);

  transform(key: string): string {
    return this.i18n.t(key);
  }
}
