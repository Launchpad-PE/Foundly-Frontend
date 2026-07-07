import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';

export interface Project {
  id: string;
  title: string;
  areas: string[];
  roles: string[];
  author: string;
  duration: string;
  modality: string;
  isOwn?: boolean;
}

@Component({
  selector: 'app-project-card',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './projectc-card.html',  // ✅
  styleUrls: ['./projectc-card.css']    // ✅
})
export class ProjectCardComponent {
  @Input() project!: Project;
  @Input() isCompact: boolean = false;
  @Input() isParticipating: boolean = false;
  @Input() isOwn: boolean = false;
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
