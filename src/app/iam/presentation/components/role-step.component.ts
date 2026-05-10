import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface RoleStepData {
  selectedRole: string;
  customRole: string;
}

@Component({
  selector: 'app-role-step',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="step-card">
      <div class="step-header">
        <h1 class="main-title">Tu Rol</h1>
        <p class="subtitle">Selecciona el rol que mejor describe tu perfil profesional.</p>
      </div>

      <div class="step-content">
        <div class="role-options">
          <div
            *ngFor="let role of predefinedRoles"
            class="role-card"
            [class.selected]="modelValue.selectedRole === role"
            (click)="selectRole(role)"
          >
            {{ role }}
          </div>
        </div>

        <div class="separator">
          <span class="separator-text">o</span>
        </div>

        <div class="custom-role-section">
          <label class="custom-role-label">Escribe tu propio rol</label>
          <input
            type="text"
            [(ngModel)]="customRoleValue"
            placeholder="Ej: Especialista en ciberseguridad"
            class="custom-role-input"
            (ngModelChange)="updateCustomRole($event)"
          />
        </div>

        <p class="info-message">
          Podrás cambiar tu rol en cualquier momento desde tu perfil.
        </p>
      </div>

      <div class="card-footer">
        <button class="back-button" (click)="prev.emit()">Atrás</button>
        <button
          class="continue-button"
          (click)="next.emit()"
          [disabled]="!modelValue.selectedRole && !modelValue.customRole"
        >
          Continuar
        </button>
      </div>
    </div>
  `,
  styles: [`
    .step-card {
      max-width: 600px; width: 100%; min-height: 520px;
      display: flex; flex-direction: column;
      background: #fff; border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1); padding: 1.5rem;
    }
    .step-header { text-align: center; margin-bottom: 0.5rem; }
    .main-title { font-size: 1.8rem; font-weight: 700; color: #6C63FF; margin-bottom: 0.5rem; }
    .subtitle { color: #6b7280; font-size: 0.95rem; line-height: 1.5; margin: 0 auto; max-width: 400px; }
    .step-content { padding: 1.5rem 0; flex: 1; display: flex; flex-direction: column; }
    .role-options { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 0.75rem; margin-bottom: 1.5rem; }
    .role-card {
      padding: 1rem 0.75rem; border: 2px solid #e5e7eb; border-radius: 8px;
      text-align: center; cursor: pointer; transition: all 0.3s ease;
      background: #fff; font-size: 0.9rem; font-weight: 500;
      min-height: 60px; display: flex; align-items: center; justify-content: center;
    }
    .role-card:hover { border-color: #6C63FF; background-color: #f8f7ff; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(108,99,255,0.1); }
    .role-card.selected { border-color: #6C63FF; background-color: #6C63FF; color: #fff; font-weight: 600; }
    .separator { position: relative; text-align: center; margin: 1.5rem 0; }
    .separator::before { content: ''; position: absolute; top: 50%; left: 0; right: 0; height: 1px; background: #e5e7eb; }
    .separator-text { background: #fff; padding: 0 1rem; color: #6b7280; font-size: 0.9rem; position: relative; z-index: 1; }
    .custom-role-section { margin-bottom: 1.5rem; }
    .custom-role-label { display: block; margin-bottom: 0.5rem; font-weight: 600; color: #374151; font-size: 0.95rem; }
    .custom-role-input { width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 6px; font-size: 1rem; box-sizing: border-box; }
    .custom-role-input:focus { outline: none; border-color: #6C63FF; box-shadow: 0 0 0 2px rgba(108,99,255,0.1); }
    .info-message { text-align: center; color: #6b7280; font-size: 0.85rem; font-style: italic; margin-top: auto; padding-top: 1rem; border-top: 1px solid #f3f4f6; }
    .card-footer { display: flex; justify-content: space-between; align-items: center; gap: 1rem; padding-top: 0.5rem; }
    .back-button { background: #fff; color: #6C63FF; border: 2px solid #6C63FF; padding: 0.6rem 1.5rem; border-radius: 6px; cursor: pointer; font-weight: 500; }
    .back-button:hover { background: #f8f7ff; }
    .continue-button { background: #FF7A30; border: none; color: #fff; font-weight: 600; padding: 0.6rem 1.5rem; border-radius: 6px; cursor: pointer; }
    .continue-button:disabled { background: #9ca3af; cursor: not-allowed; opacity: 0.6; }
    @media (max-width: 768px) {
      .role-options { grid-template-columns: 1fr; }
      .card-footer { flex-direction: column; }
      .back-button, .continue-button { width: 100%; }
    }
  `]
})
export class RoleStepComponent implements OnInit {
  @Input() modelValue: RoleStepData = { selectedRole: '', customRole: '' };
  @Output() modelValueChange = new EventEmitter<RoleStepData>();
  @Output() next = new EventEmitter<void>();
  @Output() prev = new EventEmitter<void>();

  customRoleValue = '';

  predefinedRoles = [
    'Desarrollador Frontend', 'Desarrollador Backend', 'Diseñador UI/UX',
    'Project Manager', 'Data Scientist', 'DevOps Engineer',
    'Product Owner', 'QA Tester', 'Scrum Master',
    'Business Analyst', 'Mobile Developer', 'Full Stack Developer'
  ];

  ngOnInit(): void {
    this.customRoleValue = this.modelValue.customRole || '';
  }

  selectRole(role: string): void {
    this.customRoleValue = '';
    this.modelValueChange.emit({ selectedRole: role, customRole: '' });
  }

  updateCustomRole(value: string): void {
    this.modelValueChange.emit({ selectedRole: '', customRole: value });
  }
}
