import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-recovery-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './recovery-password.html',
  styleUrls: ['./recovery-password.css']
})
export class RecoveryPasswordComponent {
  newPassword = '';
  confirmPassword = '';

  constructor(private router: Router) {}

  goBack(): void {
    this.router.navigate(['/']);
  }

  handlePasswordReset(): void {
    if (!this.newPassword || !this.confirmPassword) {
      alert('Por favor completa todos los campos');
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    if (this.newPassword.length < 6) {
      alert('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    console.log('Password reset attempt', { newPassword: this.newPassword });
    alert('Contraseña restablecida correctamente');
    this.router.navigate(['/']);
  }
}
