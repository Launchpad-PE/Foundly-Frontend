import { Component, inject } from '@angular/core';
import { UserStore } from '../../../../iam/application/user.store';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-toolbar',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './toolbar.component.html',
  styleUrl: './toolbar.component.css',
})
export class ToolbarComponent {
  private userStore = inject(UserStore);
  private router = inject(Router);
  showToolbar = true;

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
}
