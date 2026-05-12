import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-modal-forget-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './modal-forget-password.html',
  styleUrls: ['./modal-forget-password.css']
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
