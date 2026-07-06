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
      // ✅ PASO 1: Registrar usuario
      await this.userStore.register({
        fullName: this.fullName,
        email: this.email,
        password: this.password
      });

      console.log('✅ Usuario registrado, esperando 1 segundo...');

      // ✅ PASO 2: Esperar 1 segundo antes del login
      await new Promise(resolve => setTimeout(resolve, 1000));

      // ✅ PASO 3: Login automático
      await this.userStore.login(this.email, this.password);

      console.log('✅ Login exitoso');

      // ✅ PASO 4: Verificar autenticación
      if (this.userStore.isAuthenticated()) {
        console.log('✅ Usuario autenticado, redirigiendo a onboarding...');
        await this.router.navigate(['/onboarding']);
      } else {
        console.error('❌ No autenticado después del login');
        this.errorMessage = 'Error al iniciar sesión automáticamente';
      }
    } catch (error: any) {
      console.error('❌ Registration error:', error);
      this.errorMessage = error.message || 'Error en el registro';
    } finally {
      this.isLoading = false;
    }
  }
}
