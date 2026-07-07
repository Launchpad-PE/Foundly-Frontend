import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ProjectFormData } from '../../../views/create-project/create-project';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-step-info',
  imports: [FormsModule, CommonModule, TranslatePipe],
  templateUrl: './step-info.html',
  styleUrl: './step-info.css',
})
export class StepInfo {
  @Input() formData!: ProjectFormData;
  @Input() availableAreas: string[] = [];
  @Output() update = new EventEmitter<Partial<ProjectFormData>>();

  newTag = '';
  tagError = '';

  addTag(): void {
    this.tagError = '';
    const raw = this.newTag.trim().replace(/^#/, '').replace(/\s+/g, ' ');

    if (!raw) return;

    if (raw.length < 2) {
      this.tagError = 'La etiqueta debe tener al menos 2 caracteres.';
      return;
    }
    if (raw.length > 40) {
      this.tagError = 'La etiqueta no puede superar los 40 caracteres.';
      return;
    }
    if (!/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-]+$/.test(raw)) {
      this.tagError = 'Solo se permiten letras, números, espacios y guiones.';
      return;
    }
    if (this.formData.tags.includes(raw)) {
      this.tagError = 'Esta etiqueta ya fue añadida.';
      return;
    }

    this.update.emit({ tags: [...this.formData.tags, raw] });
    this.newTag = '';
  }

  removeTag(tag: string): void {
    this.update.emit({ tags: this.formData.tags.filter(t => t !== tag) });
  }

  onInputChange(): void {
    this.update.emit({
      name: this.formData.name,
      area: this.formData.area,
      summary: this.formData.summary,
    });
  }
}
