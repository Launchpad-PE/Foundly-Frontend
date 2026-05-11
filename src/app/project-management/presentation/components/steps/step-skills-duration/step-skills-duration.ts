import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ProjectFormData } from '../../../views/create-project/create-project';
import { DurationType } from '../../../../domain/value-objects/duration.vo';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-step-skills-duration',
  imports: [FormsModule, CommonModule],
  templateUrl: './step-skills-duration.html',
  styleUrl: './step-skills-duration.css',
})
export class StepSkillsDuration {
  @Input() formData!: ProjectFormData;
  @Input() academicLevels: string[] = [];
  @Input() durationTypes: { value: DurationType; label: string }[] = [];
  @Output() update = new EventEmitter<Partial<ProjectFormData>>();

  newSkill: string = '';
  newBenefit: string = '';

  addSkill(): void {
    if (this.newSkill.trim() && !this.formData.requiredSkills.includes(this.newSkill.trim())) {
      const updatedSkills = [...this.formData.requiredSkills, this.newSkill.trim()];
      this.update.emit({ requiredSkills: updatedSkills });
      this.newSkill = '';
    }
  }

  removeSkill(skill: string): void {
    const updatedSkills = this.formData.requiredSkills.filter((s) => s !== skill);
    this.update.emit({ requiredSkills: updatedSkills });
  }

  addBenefit(): void {
    if (this.newBenefit.trim() && !this.formData.benefits.includes(this.newBenefit.trim())) {
      const updatedBenefits = [...this.formData.benefits, this.newBenefit.trim()];
      this.update.emit({ benefits: updatedBenefits });
      this.newBenefit = '';
    }
  }

  removeBenefit(benefit: string): void {
    const updatedBenefits = this.formData.benefits.filter((b) => b !== benefit);
    this.update.emit({ benefits: updatedBenefits });
  }

  onDurationChange(): void {
    this.update.emit({
      durationAmount: this.formData.durationAmount,
      durationType: this.formData.durationType,
    });
  }
}
