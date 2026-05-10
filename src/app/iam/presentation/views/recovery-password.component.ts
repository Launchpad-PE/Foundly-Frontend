import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-recovery-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <header class="login-header">
      <div class="header-content">
        <div class="logo">
          <img src="/logo.png" alt="CollabUs" class="logo-img" />
        </div>
        <div class="right-container">
          <button class="back-button mobile-only" (click)="goBack()">← Volver</button>
        </div>
      </div>
    </header>

    <div class="recovery-container">
      <!-- Panel izquierdo -->
      <div class="card-left">
        <div class="logo-section">
          <img src="/logo.png" alt="CollabUs" class="logo-image" />
        </div>
        <button class="back-button desktop-only" (click)="goBack()">← Volver</button>
      </div>

      <!-- Panel derecho -->
      <div class="card-right">
        <div class="recovery-content">
          <div class="recovery-header">
            <h1 class="main-title">Nueva contraseña</h1>
            <p class="recovery-subtitle">Ingresa tu nueva contraseña para continuar.</p>
          </div>

          <form (ngSubmit)="handlePasswordReset()" class="recovery-form">
            <div class="form-group">
              <label for="newPassword">Nueva contraseña</label>
              <input type="password" id="newPassword" [(ngModel)]="newPassword" name="newPassword"
                placeholder="Nueva contraseña" required class="form-input" />
            </div>

            <div class="form-group">
              <label for="confirmPassword">Confirmar contraseña</label>
              <input type="password" id="confirmPassword" [(ngModel)]="confirmPassword" name="confirmPassword"
                placeholder="Confirma tu contraseña" required class="form-input" />
            </div>

            <button type="submit" class="recovery-button">Confirmar</button>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .recovery-container { display: flex; min-height: 100vh; background: #fff; }
    .card-left {
      width: 40%; background: #CBFCFF;
      display: flex; flex-direction: column; justify-content: center;
      align-items: center; padding: 2rem; border-right: 1px solid #e9ecef;
    }
    .logo-section { display: flex; flex-direction: column; align-items: center; gap: 1rem; margin-bottom: 2rem; }
    .logo-image { width: 300px; height: 300px; object-fit: contain; }
    .back-button {
      background: #fff; color: #6C63FF; border: 2px solid #6C63FF;
      padding: 0.75rem 1.5rem; border-radius: 6px; cursor: pointer; font-weight: 500;
    }
    .back-button:hover { background: #f8f7ff; }
    .card-right { width: 60%; display: flex; align-items: center; justify-content: center; padding: 2rem; }
    .recovery-content { width: 100%; max-width: 400px; }
    .recovery-header { text-align: center; margin-bottom: 2.5rem; }
    .main-title { font-size: 2rem; font-weight: 700; color: #6C63FF; margin-bottom: 0.5rem; }
    .recovery-subtitle { color: #6b7280; font-size: 1rem; margin: 0; }
    .recovery-form { width: 100%; }
    .form-group { margin-bottom: 1.5rem; }
    .form-group label { display: block; margin-bottom: 0.5rem; font-weight: 600; color: #374151; font-size: 0.9rem; }
    .form-input {
      width: 100%; padding: 0.75rem;
      border: 1px solid #d1d5db; border-radius: 6px;
      font-size: 1rem; box-sizing: border-box;
    }
    .form-input:focus { outline: none; border-color: #6C63FF; box-shadow: 0 0 0 2px rgba(108,99,255,0.1); }
    .recovery-button {
      width: 100%; background: #6C63FF; border: none;
      border-radius: 6px; padding: 0.75rem; color: white;
      font-weight: 600; font-size: 1rem; cursor: pointer; margin-top: 0.5rem;
    }
    .recovery-button:hover { background: #5a52d5; }
    .login-header { background-color: #fff; border-bottom: 1px solid #e2e8f0; padding: 1rem 0; position: sticky; top: 0; z-index: 100; }
    .header-content { margin: 0 auto; padding: 0 2rem; display: flex; justify-content: space-between; align-items: center; }
    .logo-img { height: 60px; width: auto; object-fit: contain; }
    .right-container { display: flex; align-items: center; gap: 1rem; }
    .mobile-only { display: none; }
    .desktop-only { display: block; }
    @media (max-width: 768px) {
      .recovery-container { flex-direction: column; min-height: calc(100vh - 80px); }
      .card-left { display: none; }
      .card-right { width: 100%; padding: 1.5rem; }
      .mobile-only { display: block; }
      .desktop-only { display: none; }
      .main-title { font-size: 1.5rem; }
    }
  `]
})
export class RecoveryPasswordComponent {
  newPassword = '';
  confirmPassword = '';

  constructor(private router: Router) {}

  goBack(): void {
    this.router.navigate(['/']);
  }

  handlePasswordReset(): void {
    if (this.newPassword !== this.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }
    console.log('Password reset attempt');
    this.router.navigate(['/']);
  }
}
