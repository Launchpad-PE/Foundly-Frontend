import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface DescriptionStepData {
  bio: string;
}

@Component({
  selector: 'app-description-step',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="step-card">
      <div class="step-header">
        <h1 class="main-title">Tu Descripción</h1>
        <p class="subtitle">Cuéntale a la comunidad un poco sobre ti y tu experiencia.</p>
      </div>

      <div class="step-content">
        <div class="form-group">
          <label for="bio" class="form-label">Biografía</label>
          <textarea
            id="bio"
            [(ngModel)]="bioText"
            rows="6"
            placeholder="Cuéntanos sobre tu experiencia, habilidades y lo que te apasiona..."
            class="bio-textarea"
            (ngModelChange)="emitUpdate()"
          ></textarea>
          <div
            class="char-counter"
            [class.warning]="bioText.length > 400"
            [class.error]="bioText.length >= 500"
          >
            {{ bioText.length }} / 500 caracteres
          </div>
          <p class="input-hint">Esta información será visible en tu perfil público.</p>
        </div>
      </div>

      <div class="card-footer">
        <button class="back-button" (click)="prev.emit()">Atrás</button>
        <div class="right-buttons">
          <button class="skip-button" (click)="complete.emit()">Omitir</button>
          <button
            class="continue-button"
            (click)="complete.emit()"
            [disabled]="!bioText.trim()"
          >
            Completar
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .step-card {
      max-width: 600px; width: 100%; min-height: 480px;
      display: flex; flex-direction: column;
      background: #fff; border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1); padding: 1.5rem;
    }
    .step-header { text-align: center; margin-bottom: 0.5rem; }
    .main-title { font-size: 1.8rem; font-weight: 700; color: #6C63FF; margin-bottom: 0.5rem; }
    .subtitle { color: #6b7280; font-size: 0.95rem; line-height: 1.5; margin: 0 auto; max-width: 400px; }
    .step-content { padding: 1.5rem 0; flex: 1; display: flex; flex-direction: column; }
    .form-group { margin-bottom: 1rem; flex: 1; display: flex; flex-direction: column; }
    .form-label { display: block; margin-bottom: 0.75rem; font-weight: 600; color: #374151; font-size: 1rem; text-align: center; }
    .bio-textarea {
      width: 100%; resize: vertical; min-height: 200px; flex: 1;
      border: 2px solid #e5e7eb; border-radius: 8px; padding: 1rem;
      font-size: 0.95rem; line-height: 1.5; box-sizing: border-box; font-family: inherit;
    }
    .bio-textarea:focus { outline: none; border-color: #6C63FF; box-shadow: 0 0 0 2px rgba(108,99,255,0.1); }
    .char-counter { text-align: right; font-size: 0.75rem; color: #6b7280; margin-top: 0.5rem; }
    .char-counter.warning { color: #f59e0b; font-weight: 600; }
    .char-counter.error { color: #ef4444; font-weight: 600; }
    .input-hint { color: #6b7280; font-size: 0.8rem; margin-top: 0.5rem; text-align: center; font-style: italic; }
    .card-footer { display: flex; justify-content: space-between; align-items: center; gap: 1rem; padding-top: 0.5rem; }
    .right-buttons { display: flex; gap: 0.75rem; align-items: center; }
    .back-button { background: #fff; color: #6C63FF; border: 2px solid #6C63FF; padding: 0.6rem 1.5rem; border-radius: 6px; cursor: pointer; font-weight: 500; }
    .back-button:hover { background: #f8f7ff; }
    .skip-button { background: none; border: none; color: #6b7280; cursor: pointer; font-size: 0.9rem; }
    .skip-button:hover { text-decoration: underline; }
    .continue-button { background: #FF7A30; border: none; color: #fff; font-weight: 600; padding: 0.6rem 1.5rem; border-radius: 6px; cursor: pointer; }
    .continue-button:disabled { background: #9ca3af; cursor: not-allowed; opacity: 0.6; }
    @media (max-width: 768px) {
      .card-footer { flex-direction: column; }
      .right-buttons { width: 100%; justify-content: space-between; }
      .back-button, .continue-button { width: 100%; }
    }
  `]
})
export class DescriptionStepComponent implements OnInit {
  @Input() modelValue: DescriptionStepData = { bio: '' };
  @Output() modelValueChange = new EventEmitter<DescriptionStepData>();
  @Output() complete = new EventEmitter<void>();
  @Output() prev = new EventEmitter<void>();

  bioText = '';

  ngOnInit(): void {
    this.bioText = this.modelValue.bio || '';
  }

  emitUpdate(): void {
    this.modelValueChange.emit({ bio: this.bioText });
  }
}
