import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-progress-stepper',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './progress-stepper.html',  // Cambiado
  styleUrls: ['./progress-stepper.css'],   // Cambiado
})
export class ProgressStepperComponent {
  @Input() currentStep = 1;
  @Input() totalSteps = 4;

  get stepsArray(): number[] {
    return Array.from({ length: this.totalSteps }, (_, i) => i + 1);
  }
}
