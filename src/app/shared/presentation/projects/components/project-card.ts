// shared/presentation/components/project-card/project-card.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Project } from '../../../../project-management/domain/entities/project.entity';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-project-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './project-card.html',
  styleUrls: ['./project-card.css']
})
export class ProjectCardComponent {
  @Input() project!: Project;
  @Input() isCompact: boolean = false;
  @Input() showApplyButton: boolean = true;
  @Output() viewDetails = new EventEmitter<string>();
  @Output() apply = new EventEmitter<string>();

  getRolesToShow(): string[] {
    const roles = this.project.roles.map(role => role.name.getValue());
    return this.isCompact ? roles.slice(0, 2) : roles;
  }

  onViewDetails(): void {
    this.viewDetails.emit(this.project.id);
  }

  onApply(): void {
    this.apply.emit(this.project.id);
  }

  // Getters para facilitar el acceso en el template
  get projectTitle(): string {
    return this.project.name.getValue();
  }

  get projectArea(): string {
    return this.project.area.getValue();
  }

  get projectAuthor(): string {
    return this.project.authorId.toString();
  }

  get projectDuration(): string {
    return this.project.duration.toString();
  }

  get projectModality(): string {
    // Si no tienes modality, puedes derivarlo o usar un valor por defecto
    return this.project.duration.getType() === 'semanas' ? 'Remoto' : 'Presencial';
  }
}
