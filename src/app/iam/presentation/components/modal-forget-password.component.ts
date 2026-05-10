import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-modal-forget-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div *ngIf="visible" class="modal-overlay" (click)="close()">
      <div class="modal-dialog" (click)="$event.stopPropagation()">
        <!-- Header -->
        <div class="modal-header">
          <h2 class="modal-title">Recuperar contraseña</h2>
          <button class="modal-close" (click)="close()">✕</button>
        </div>

        <!-- Content -->
        <div class="modal-content">
          <p class="instruction-text">
            Ingresa tu correo electrónico para recibir instrucciones de recuperación.
          </p>

          <div class="field">
            <input
              type="email"
              [(ngModel)]="recoveryEmail"
              placeholder="email@example.com"
              class="email-input"
              [class.invalid]="emailError"
              (ngModelChange)="clearError()"
            />
            <small *ngIf="emailError" class="error-text">{{ emailError }}</small>
          </div>
        </div>

        <!-- Footer -->
        <div class="modal-footer">
          <button
            class="send-button"
            [disabled]="!recoveryEmail"
            (click)="handleSubmit()"
          >
            Enviar
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }
    .modal-dialog {
      background: #fff;
      border-radius: 0.5rem;
      width: 25rem;
      max-width: 90vw;
      box-shadow: 0 10px 25px rgba(0,0,0,0.1);
    }
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.5rem;
      border-bottom: 1px solid #e5e7eb;
    }
    .modal-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: #1f2937;
      margin: 0;
      flex: 1;
      text-align: center;
    }
    .modal-close {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 1rem;
      color: #6b7280;
    }
    .modal-content {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      padding: 1.5rem;
    }
    .instruction-text {
      color: #374151;
      margin: 0;
      line-height: 1.5;
      font-size: 1rem;
      text-align: center;
    }
    .field { display: flex; flex-direction: column; gap: 0.5rem; }
    .email-input {
      width: 100%;
      padding: 0.75rem;
      font-size: 1rem;
      border: 1px solid #d1d5db;
      border-radius: 0.375rem;
      box-sizing: border-box;
    }
    .email-input:focus {
      outline: none;
      border-color: #3f51b5;
      box-shadow: 0 0 0 2px rgba(63,81,181,0.1);
    }
    .email-input.invalid { border-color: #dc2626 !important; }
    .error-text { color: #dc2626; font-size: 0.875rem; }
    .modal-footer {
      display: flex;
      justify-content: center;
      padding: 1rem 1.5rem;
    }
    .send-button {
      background-color: #FF7A30;
      border: none;
      color: #fff;
      padding: 0.75rem 2rem;
      font-size: 1rem;
      font-weight: 500;
      border-radius: 0.375rem;
      cursor: pointer;
      min-width: 120px;
      transition: background-color 0.3s;
    }
    .send-button:hover:not(:disabled) { background-color: #303f9f; }
    .send-button:disabled { background-color: #9ca3af; cursor: not-allowed; }
  `]
})
export class ModalForgetPasswordComponent {
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() submitEmail = new EventEmitter<string>();

  recoveryEmail = '';
  emailError = '';

  close(): void {
    this.visibleChange.emit(false);
  }

  clearError(): void {
    this.emailError = '';
  }

  handleSubmit(): void {
    if (!this.recoveryEmail) {
      this.emailError = 'El correo electrónico es requerido';
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.recoveryEmail)) {
      this.emailError = 'Ingresa un correo electrónico válido';
      return;
    }

    this.emailError = '';
    this.submitEmail.emit(this.recoveryEmail);
    this.visibleChange.emit(false);
    this.recoveryEmail = '';
  }
}
