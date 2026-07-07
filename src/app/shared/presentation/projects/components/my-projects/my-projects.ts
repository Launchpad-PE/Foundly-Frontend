import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

export interface ProjectCardData {
  id: string;
  title: string;
  areas: string[];
  roles: string[];
  author: string;
  duration: string;
  modality: string;
  status?: string;
}

@Component({
  selector: 'app-my-projects',
  imports: [TranslatePipe],
  templateUrl: './my-projects.html',
  styleUrl: './my-projects.css',
})
export class MyProjects {
  @Input() project!: ProjectCardData;
  @Input() isCompact: boolean = false;
  @Input() showApplyButton: boolean = true;
  @Output() viewDetails = new EventEmitter<string>();
  @Output() apply = new EventEmitter<string>();

  getRolesToShow(): string[] {
    return this.isCompact ? this.project.roles.slice(0, 2) : this.project.roles;
  }

  onViewDetails(): void {
    this.viewDetails.emit(this.project.id);
  }

  onApply(): void {
    this.apply.emit(this.project.id);
  }

  getModalityClass(): string {
    return this.project.modality === 'Remoto' ? 'badge-remote' : 'badge-presential';
  }
}
