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
  templateUrl: './profile-step.html',
  styleUrls: ['./profile-step.css']
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
