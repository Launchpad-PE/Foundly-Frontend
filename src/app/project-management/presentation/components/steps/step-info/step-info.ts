import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ProjectFormData } from '../../../views/create-project/create-project';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-step-info',
  imports: [FormsModule, CommonModule],
  templateUrl: './step-info.html',
  styleUrl: './step-info.css',
})

export class StepInfo {
  @Input() formData!: ProjectFormData;
  @Input() availableAreas: string[] = [];
  @Output() update = new EventEmitter<Partial<ProjectFormData>>();

  newTag: string = '';

  addTag(): void {
    if (this.newTag.trim() && !this.formData.tags.includes(this.newTag.trim())) {
      const updatedTags = [...this.formData.tags, this.newTag.trim()];
      this.update.emit({ tags: updatedTags });
      this.newTag = '';
    }
  }

  removeTag(tag: string): void {
    const updatedTags = this.formData.tags.filter((t) => t !== tag);
    this.update.emit({ tags: updatedTags });
  }

  onInputChange(): void {
    this.update.emit({
      name: this.formData.name,
      area: this.formData.area,
      summary: this.formData.summary,
    });
  }
}
