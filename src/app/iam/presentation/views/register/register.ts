// iam/presentation/views/register/register.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UserStore } from '../../../application/user.store';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslatePipe],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class RegisterComponent {
  fullName = '';
  email = '';
  password = '';
  confirmPassword = '';
  isLoading = false;
  errorMessage = '';

  constructor(public userStore: UserStore, private router: Router) {}

  goBack(): void {
    this.router.navigate(['/']);
  }

  async handleRegister(): Promise<void> {
    this.errorMessage = '';

    if (!this.fullName || !this.email || !this.password) {
      this.errorMessage = 'Por favor completa todos los campos';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden';
      return;
    }

    if (this.password.length < 6) {
      this.errorMessage = 'La contraseña debe tener al menos 6 caracteres';
      return;
    }

    this.isLoading = true;

    try {
      // Registrar usuario
      await this.userStore.register({
        fullName: this.fullName,
        email: this.email,
        password: this.password
      });

      // Login automático después del registro
      await this.userStore.login(this.email, this.password);

      // Verificar si está autenticado y redirigir a onboarding
      if (this.userStore.isAuthenticated()) {
        console.log('✅ Registro exitoso, redirigiendo a onboarding...');
        await this.router.navigate(['/onboarding']);
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      this.errorMessage = error.message || 'Error en el registro';
    } finally {
      this.isLoading = false;
    }
  }
}
