import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ProjectFormData } from '../../../views/create-project/create-project';
import { EnvironmentalMetric } from '../../../../domain/value-objects/environmental-impact.vo';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-step-evironmental',
  imports: [FormsModule, CommonModule],
  templateUrl: './step-evironmental.html',
  styleUrl: './step-evironmental.css',
})
export class StepEvironmental {
  @Input() formData!: ProjectFormData;
  @Output() update = new EventEmitter<Partial<ProjectFormData>>();

  environmentalMetrics = [
    { value: EnvironmentalMetric.AIR_QUALITY, label: 'Calidad del aire', icon: '🌬️' },
    { value: EnvironmentalMetric.HUMIDITY, label: 'Humedad ambiental', icon: '💧' },
    { value: EnvironmentalMetric.TEMPERATURE, label: 'Temperatura', icon: '🌡️' },
    {
      value: EnvironmentalMetric.CITIZEN_PARTICIPATION,
      label: 'Participación ciudadana',
      icon: '👥',
    },
  ];

  toggleEnvironmentalMetric(metric: EnvironmentalMetric): void {
    const currentMetrics = this.formData.environmentalImpact || [];
    let updatedMetrics: EnvironmentalMetric[];

    if (currentMetrics.includes(metric)) {
      updatedMetrics = currentMetrics.filter((m) => m !== metric);
    } else {
      updatedMetrics = [...currentMetrics, metric];
    }

    this.update.emit({
      environmentalImpact: updatedMetrics,
      hasEnvironmentalImpact: updatedMetrics.length > 0,
    });
  }

  isSelected(metric: EnvironmentalMetric): boolean {
    return (this.formData.environmentalImpact || []).includes(metric);
  }
}
