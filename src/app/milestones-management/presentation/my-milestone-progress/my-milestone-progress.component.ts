import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-my-milestone-progress',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-milestone-progress.component.html',
  styleUrl: './my-milestone-progress.component.css',
})
export class MilestoneProgressComponent {
  percentage = input.required<number>();
  size = input<'small' | 'medium' | 'large'>('medium');
  showLabel = input(true);
  showPercentage = input(true);
  type = input<'bar' | 'circle'>('bar');

  // Computed sizes
  get containerSize(): number {
    switch (this.size()) {
      case 'small': return 60;
      case 'medium': return 100;
      case 'large': return 140;
      default: return 100;
    }
  }

  get strokeWidth(): number {
    switch (this.size()) {
      case 'small': return 6;
      case 'medium': return 8;
      case 'large': return 10;
      default: return 8;
    }
  }

  get radius(): number {
    return (this.containerSize - this.strokeWidth) / 2;
  }

  get circumference(): number {
    return 2 * Math.PI * this.radius;
  }

  get strokeDashoffset(): number {
    const pct = Math.min(100, Math.max(0, this.percentage()));
    return this.circumference - (pct / 100) * this.circumference;
  }

  get barHeight(): string {
    switch (this.size()) {
      case 'small': return '6px';
      case 'medium': return '8px';
      case 'large': return '10px';
      default: return '8px';
    }
  }

  get percentageValue(): number {
    return Math.min(100, Math.max(0, this.percentage()));
  }

  get progressColor(): string {
    const pct = this.percentageValue;
    if (pct >= 80) return '#059669';
    if (pct >= 50) return '#4f46e5';
    if (pct >= 25) return '#f59e0b';
    return '#ef4444';
  }
}
