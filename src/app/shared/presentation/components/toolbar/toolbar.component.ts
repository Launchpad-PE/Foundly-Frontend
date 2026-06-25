import { Component, inject } from '@angular/core';
import { UserStore } from '../../../../iam/application/user.store';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../../../../../server/i18n/translate.pipe';
import { TranslationService, Lang } from '../../../../../../server/i18n/translation.service';

@Component({
  selector: 'app-toolbar',
  imports: [CommonModule, RouterLink, RouterLinkActive, TranslatePipe],
  templateUrl: './toolbar.component.html',
  styleUrl: './toolbar.component.css',
})
export class ToolbarComponent {
  private userStore = inject(UserStore);
  private router = inject(Router);
  private i18n = inject(TranslationService);
  lang = this.i18n.lang;
  showToolbar = true;

  setLang(lang: Lang): void {
    this.i18n.setLang(lang);
  }

  constructor() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      const hideToolbarRoutes = ['/login', '/register', '/recovery-password'];
      this.showToolbar = !hideToolbarRoutes.includes(event.urlAfterRedirects);
    });
  }

  logout(): void {
    this.userStore.logout();
    this.router.navigate(['/login']);
  }

  goToHome(): void {
    this.router.navigate(['/home']);
  }

  goToProfile(): void {
    this.router.navigate(['/profile']);
  }
}
