import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { UserStore } from '../../../application/user.store';
import { ModalForgetPasswordComponent } from '../../components/modal-forget-password/modal-forget-password';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ModalForgetPasswordComponent],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  email = '';
  password = '';
  loginError = signal('');
  showForgotPasswordModal = false;

  constructor(public userStore: UserStore, private router: Router) {}

  goBack(): void {
    window.location.href = 'https://launchpad-pe.github.io/Foundly-Landing-Page/';
  }

  openForgotPasswordModal(): void {
    this.showForgotPasswordModal = true;
  }

  goToRegister(): void {
    this.router.navigate(['/register']);
  }

  async handleLogin(): Promise<void> {
    this.loginError.set('');

    if (!this.email || !this.password) {
      this.loginError.set('Por favor completa todos los campos');
      return;
    }

    try {
      await this.userStore.login(this.email, this.password);
      this.router.navigate(['/home']);
    } catch (error: any) {
      this.loginError.set(error.message || 'Error al iniciar sesión');
    }
  }

  handlePasswordRecovery(email: string): void {
    console.log('Password recovery for:', email);
  }
}
