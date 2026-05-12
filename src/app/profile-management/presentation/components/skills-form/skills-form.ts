import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface ExperienceData {
  id?: string;
  title: string;
  company: string;
  period: string;
}

export interface SkillsFormData {
  abilities: string[];
  experiences: ExperienceData[];
}

@Component({
  selector: 'app-skills-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './skills-form.html',
  styleUrls: ['./skills-form.css']
})
export class SkillsFormComponent {
  @Input() modelValue: SkillsFormData = { abilities: [], experiences: [] };
  @Output() modelValueChange = new EventEmitter<SkillsFormData>();
  @Output() next = new EventEmitter<void>();
  @Output() prev = new EventEmitter<void>();

  newSkill = '';
  showExperienceForm = false;

  newExperience: ExperienceData = {
    title: '',
    company: '',
    period: ''
  };

  addSkill(): void {
    if (this.newSkill.trim() && !this.modelValue.abilities.includes(this.newSkill.trim())) {
      this.modelValue.abilities.push(this.newSkill.trim());
      this.newSkill = '';
      this.emitUpdate();
    }
  }

  removeSkill(skill: string): void {
    this.modelValue.abilities = this.modelValue.abilities.filter(s => s !== skill);
    this.emitUpdate();
  }

  addExperience(): void {
    if (this.newExperience.title && this.newExperience.company) {
      this.modelValue.experiences.push({ ...this.newExperience });
      this.newExperience = { title: '', company: '', period: '' };
      this.showExperienceForm = false;
      this.emitUpdate();
    }
  }

  removeExperience(index: number): void {
    this.modelValue.experiences.splice(index, 1);
    this.emitUpdate();
  }

  private emitUpdate(): void {
    this.modelValueChange.emit(this.modelValue);
  }

  onSubmit(): void {
    this.next.emit();
  }
}
