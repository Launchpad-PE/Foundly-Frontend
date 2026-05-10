import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-progress-stepper',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="progress-stepper">
      <ng-container *ngFor="let step of stepsArray; let i = index">
        <div
          class="step"
          [class.active]="i + 1 === currentStep"
          [class.completed]="i + 1 < currentStep"
          [class.upcoming]="i + 1 > currentStep"
        >
          <div class="step-circle">
            <span *ngIf="i + 1 === currentStep" class="inner-dot"></span>
            <span *ngIf="i + 1 < currentStep" class="checkmark">✓</span>
          </div>
          <div *ngIf="i + 1 < totalSteps" class="step-connector"></div>
        </div>
      </ng-container>
    </div>
  `,
  styles: [`
    .progress-stepper {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 1rem 0;
    }
    .step {
      display: flex;
      align-items: center;
      flex: 1;
      position: relative;
    }
    .step-circle {
      width: 2.5rem;
      height: 2.5rem;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 0.875rem;
      z-index: 2;
      transition: all 0.3s ease;
      background-color: #f3f4f6;
      border: 2px solid #d1d5db;
      color: #9ca3af;
    }
    .step.active .step-circle {
      background-color: #6C63FF;
      border-color: #6C63FF;
      color: #fff;
      box-shadow: 0 0 0 4px rgba(108, 99, 255, 0.2);
    }
    .inner-dot {
      width: 8px;
      height: 8px;
      background-color: #fff;
      border-radius: 50%;
      display: inline-block;
    }
    .step.completed .step-circle {
      background-color: #10b981;
      border-color: #10b981;
      color: #fff;
    }
    .step.completed .checkmark { font-weight: bold; font-size: 1rem; }
    .step.upcoming .step-circle {
      background-color: #f3f4f6;
      border-color: #d1d5db;
      color: #9ca3af;
    }
    .step-connector {
      flex: 1;
      height: 2px;
      background-color: #e5e7eb;
      margin: 0 0.5rem;
      transition: background-color 0.3s ease;
    }
    .step.completed .step-connector { background-color: #10b981; }
    .step.active .step-connector {
      background: linear-gradient(90deg, #10b981 50%, #e5e7eb 50%);
    }
    @media (max-width: 768px) {
      .progress-stepper { gap: 0.25rem; }
      .step-circle { width: 2rem; height: 2rem; }
      .inner-dot { width: 6px; height: 6px; }
      .step.completed .checkmark { font-size: 0.875rem; }
      .step-connector { margin: 0 0.25rem; }
    }
  `]
})
export class ProgressStepperComponent {
  @Input() currentStep = 1;
  @Input() totalSteps = 4;

  get stepsArray(): number[] {
    return Array.from({ length: this.totalSteps }, (_, i) => i + 1);
  }
}
