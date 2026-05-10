import { Component, Input, Output, EventEmitter, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface ProfileStepData {
  avatar: string | null;
  username: string;
}

@Component({
  selector: 'app-profile-step',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="step-card">
      <div class="step-header">
        <h1 class="main-title">Tu Perfil</h1>
      </div>

      <div class="step-content">
        <div class="avatar-section">
          <div class="avatar-upload">
            <div class="avatar-container">
              <div
                class="avatar-placeholder"
                [style.backgroundImage]="hasImage ? 'url(' + currentImage + ')' : ''"
                (click)="chooseFile()"
              >
                <div *ngIf="!hasImage" class="avatar-empty-state">
                  <svg class="add-photo-icon" width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 9C3 7.89543 3.89543 7 5 7H5.92963C6.59834 7 7.2228 6.6658 7.59373 6.1094L8.40627 4.8906C8.7772 4.3342 9.40166 4 10.0704 4H13.9296C14.5983 4 15.2228 4.3342 15.5937 4.8906L16.4063 6.1094C16.7772 6.6658 17.4017 7 18.0704 7H19C20.1046 7 21 7.89543 21 9V18C21 19.1046 20.1046 20 19 20H5C3.89543 20 3 19.1046 3 18V9Z" stroke="white" stroke-width="2"/>
                    <circle cx="12" cy="13" r="3" stroke="white" stroke-width="2"/>
                    <path d="M8 8H8.01" stroke="white" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                </div>
                <div *ngIf="hasImage" class="avatar-overlay">
                  <span class="change-text">Cambiar</span>
                </div>
              </div>
            </div>
            <p class="avatar-hint">
              {{ hasImage ? 'Clic para cambiar la foto' : 'Clic para agregar una foto' }}
            </p>
            <input
              #fileInput
              type="file"
              accept="image/*"
              (change)="onFileSelect($event)"
              class="hidden-file-input"
            />
          </div>
        </div>

        <div class="form-group">
          <label for="username">Nombre de usuario</label>
          <input
            type="text"
            id="username"
            [(ngModel)]="username"
            placeholder="Ingresa tu nombre de usuario"
            class="text-input"
            (ngModelChange)="emitUpdate()"
          />
        </div>
      </div>

      <div class="card-footer">
        <button class="continue-button" (click)="next.emit()">
          Continuar
        </button>
      </div>
    </div>
  `,
  styles: [`
    .step-card {
      max-width: 500px;
      width: 100%;
      min-height: 460px;
      display: flex;
      flex-direction: column;
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      padding: 1.5rem;
    }
    .step-header { text-align: center; margin-bottom: 0.5rem; }
    .main-title { font-size: 1.8rem; font-weight: 700; color: #6C63FF; }
    .step-content { padding: 2rem 0; flex: 1; }
    .avatar-section { text-align: center; margin-bottom: 1.5rem; }
    .avatar-upload { display: flex; flex-direction: column; align-items: center; gap: 0.75rem; position: relative; }
    .avatar-container { position: relative; display: inline-block; }
    .avatar-placeholder {
      width: 80px; height: 80px; border-radius: 50%;
      background-color: #6C63FF; border: 2px dashed #6C63FF;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; transition: all 0.3s ease;
      background-size: cover; background-position: center;
      overflow: hidden; position: relative;
    }
    .avatar-placeholder:hover { background-color: #5a52d5; border-color: #5a52d5; transform: scale(1.05); }
    .avatar-empty-state { display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; }
    .avatar-overlay {
      position: absolute; inset: 0;
      background: rgba(0,0,0,0.6);
      display: flex; align-items: center; justify-content: center;
      opacity: 0; transition: opacity 0.3s ease;
    }
    .avatar-placeholder:hover .avatar-overlay { opacity: 1; }
    .change-text { color: #fff; font-size: 0.7rem; font-weight: 600; }
    .avatar-hint { color: #6b7280; font-size: 0.8rem; margin: 0; }
    .hidden-file-input { position: absolute; opacity: 0; width: 0; height: 0; pointer-events: none; }
    .form-group { margin-bottom: 1rem; }
    .form-group label { display: block; margin-bottom: 0.375rem; font-weight: 600; color: #374151; font-size: 0.9rem; }
    .text-input {
      width: 100%; padding: 0.75rem;
      border: 1px solid #d1d5db; border-radius: 6px; font-size: 1rem;
      box-sizing: border-box;
    }
    .text-input:focus { outline: none; border-color: #6C63FF; box-shadow: 0 0 0 2px rgba(108,99,255,0.1); }
    .card-footer { display: flex; justify-content: flex-end; padding-top: 0.5rem; }
    .continue-button {
      background: #FF7A30; border: none; color: #fff;
      font-weight: 600; padding: 0.6rem 1.5rem; border-radius: 6px;
      font-size: 0.9rem; cursor: pointer;
    }
    .continue-button:hover { background: #e56a20; }
  `]
})
export class ProfileStepComponent implements OnInit {
  @Input() modelValue: ProfileStepData = { avatar: null, username: '' };
  @Output() modelValueChange = new EventEmitter<ProfileStepData>();
  @Output() next = new EventEmitter<void>();
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  hasImage = false;
  currentImage = '';
  username = '';

  ngOnInit(): void {
    this.username = this.modelValue.username || '';
    if (this.modelValue.avatar) {
      this.currentImage = this.modelValue.avatar;
      this.hasImage = true;
    }
  }

  chooseFile(): void {
    this.fileInput?.nativeElement.click();
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido');
      return;
    }
    if (file.size > 1_000_000) {
      alert('La imagen debe ser menor a 1MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      this.currentImage = e.target?.result as string;
      this.hasImage = true;
      this.emitUpdate();
    };
    reader.readAsDataURL(file);
  }

  emitUpdate(): void {
    this.modelValueChange.emit({ username: this.username, avatar: this.currentImage || null });
  }
}
