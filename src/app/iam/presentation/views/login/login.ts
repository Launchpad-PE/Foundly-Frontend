import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { UserStore } from '../../../application/user.store';
import { ModalForgetPasswordComponent } from '../../components/modal-forget-password/modal-forget-password';
import { environment } from '../../../../../environments/environment';
import { TranslatePipe } from '../../../../../../server/i18n/translate.pipe';
import { TranslationService, Lang } from '../../../../../../server/i18n/translation.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ModalForgetPasswordComponent, TranslatePipe],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  private i18n = inject(TranslationService);
  lang = this.i18n.lang;

  email = '';
  password = '';
  loginError = signal('');
  showForgotPasswordModal = false;
  isLoading = false;

  constructor(public userStore: UserStore, private router: Router) {}

  setLang(lang: Lang): void {
    this.i18n.setLang(lang);
  }

  goBack(): void {
    window.location.href = environment.landingPageRedirection;
  }

  openForgotPasswordModal(): void {
    this.showForgotPasswordModal = true;
  }

  goToRegister(): void {
    this.router.navigate(['/register']);
  }

  async handleLogin(): Promise<void> {
    this.loginError.set('');
    this.isLoading = true;

    if (!this.email || !this.password) {
      this.loginError.set('Por favor completa todos los campos');
      this.isLoading = false;
      return;
    }

    try {
      await this.userStore.login(this.email, this.password);

      // Después del login, verificar si necesita onboarding
      if (this.userStore.needsOnboarding()) {
        console.log('📝 Needs onboarding, redirecting...');
        await this.router.navigate(['/onboarding']);
      } else {
        console.log('🏠 Redirecting to home...');
        await this.router.navigate(['/home']);
      }
    } catch (error: any) {
      this.loginError.set(error.message || 'Error al iniciar sesión');
    } finally {
      this.isLoading = false;
    }
  }

  handlePasswordRecovery(email: string): void {
    console.log('Password recovery for:', email);
  }
}
