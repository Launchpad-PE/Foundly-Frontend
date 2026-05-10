import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserStore } from '../../../application/user.store';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class RegisterComponent {
  fullName = '';
  email = '';
  password = '';
  confirmPassword = '';

  constructor(public userStore: UserStore, private router: Router) {}

  goBack(): void {
    this.router.navigate(['/']);
  }

  async handleRegister(): Promise<void> {
    if (this.password !== this.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    if (this.password.length < 6) {
      alert('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      await this.userStore.register({
        fullName: this.fullName,
        email: this.email,
        password: this.password
      });
      await this.userStore.login(this.email, this.password);

      if (this.userStore.isAuthenticated()) {
        console.log('✅ Registro exitoso, redirigiendo a onboarding...');
        this.router.navigate(['/onboarding']);
      }
    } catch (error: any) {
      alert(error.message || 'Error en el registro');
    }
  }
}
