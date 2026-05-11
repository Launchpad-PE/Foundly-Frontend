// project-card.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-project-card',
  templateUrl: '.my-projects.html',
  styleUrls: ['.my-projects.css']
})
export class ProjectCardComponent {
  @Input() project: any;
  @Input() isCompact: boolean = false;
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
}
