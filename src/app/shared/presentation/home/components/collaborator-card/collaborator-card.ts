import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Collaborator {
  id: string;
  name: string;
  role: string;
  skills?: string[];
  avatar?: string;
}

const AVATAR_GRADIENTS = [
  'linear-gradient(135deg, #667eea, #764ba2)',
  'linear-gradient(135deg, #f093fb, #f5576c)',
  'linear-gradient(135deg, #4facfe, #00f2fe)',
  'linear-gradient(135deg, #43e97b, #38f9d7)',
  'linear-gradient(135deg, #fa709a, #fee140)',
  'linear-gradient(135deg, #a18cd1, #fbc2eb)',
];

@Component({
  selector: 'app-collaborator-card',
  standalone: true,
  templateUrl: './collaborator-card.html',
  styleUrls: ['./collaborator-card.css'],
  imports: [CommonModule]
})
export class CollaboratorCardComponent {
  @Input() collaborator!: Collaborator;
  @Output() viewProfile = new EventEmitter<string>();

  get avatarGradient(): string {
    const index = parseInt(this.collaborator.id, 10) % AVATAR_GRADIENTS.length;
    return AVATAR_GRADIENTS[index];
  }

  get initials(): string {
    return this.collaborator.name
      .split(' ')
      .slice(0, 2)
      .map(n => n[0])
      .join('');
  }

  onViewProfile(): void {
    this.viewProfile.emit(this.collaborator.id);
  }
}
