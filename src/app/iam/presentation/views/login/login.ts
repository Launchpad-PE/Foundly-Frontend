import { Component, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { UserStore } from '../../../application/user.store';
import { ModalForgetPasswordComponent } from '../../components/modal-forget-password/modal-forget-password';
import { environment } from '../../../../../environments/environment';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ModalForgetPasswordComponent, TranslatePipe],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  private translate = inject(TranslateService);

  currentLang = computed(() => this.translate.currentLang() ?? 'es');

  email = '';
  password = '';
  loginError = signal('');
  showForgotPasswordModal = false;
  isLoading = false;

  constructor(public userStore: UserStore, private router: Router) {}

  setLang(lang: string): void {
    this.translate.use(lang);
    localStorage.setItem('lang', lang);
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

      // ✅ Esperar a que cargue el perfil
      await new Promise(resolve => setTimeout(resolve, 1000));

      // ✅ Forzar recarga del perfil
      const userId = this.userStore.currentUser()?.id;
      if (userId) {
        console.log('📋 Forzando recarga de perfil para userId:', userId);
        await this.userStore.loadUserProfile(userId);
      }

      const needsOnboarding = this.userStore.needsOnboarding();
      console.log('🔍 Login - needsOnboarding:', needsOnboarding);

      if (needsOnboarding) {
        console.log('📝 Needs onboarding, redirecting...');
        await this.router.navigate(['/onboarding']);
      } else {
        console.log('🏠 Redirecting to home...');
        await this.router.navigate(['/home']);
      }
    } catch (error: any) {
      console.error('❌ Error en login:', error);
      this.loginError.set(error.message || 'Error al iniciar sesión');
    } finally {
      this.isLoading = false;
    }
  }


  handlePasswordRecovery(email: string): void {
    console.log('Password recovery for:', email);
  }
}
