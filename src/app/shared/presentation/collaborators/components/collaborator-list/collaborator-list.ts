import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Profile } from '../../../../../profile-management/domain/entities/profile.entity';
import { NgForOf, NgIf } from '@angular/common';

const AVATAR_GRADIENTS = [
  'linear-gradient(135deg, #667eea, #764ba2)',
  'linear-gradient(135deg, #f093fb, #f5576c)',
  'linear-gradient(135deg, #4facfe, #00f2fe)',
  'linear-gradient(135deg, #43e97b, #38f9d7)',
  'linear-gradient(135deg, #fa709a, #fee140)',
  'linear-gradient(135deg, #a18cd1, #fbc2eb)',
];

@Component({
  selector: 'app-collaborator-list',
  imports: [
    NgForOf,
    NgIf
  ],
  templateUrl: './collaborator-list.html',
  styleUrl: './collaborator-list.css',
})
export class CollaboratorList {
  @Input() collaborator!: Profile;
  @Output() viewProfile = new EventEmitter<string>();

  get avatarGradient(): string {
    const id = this.collaborator?.id || '';
    const index = id.length % AVATAR_GRADIENTS.length;
    return AVATAR_GRADIENTS[index];
  }

  get initials(): string {
    const username = this.collaborator?.username || '';
    return username
      .split(' ')
      .slice(0, 2)
      .map(n => n[0] || '')
      .join('')
      .toUpperCase() || '?';
  }

  get displayName(): string {
    return this.collaborator?.username || 'Usuario';
  }

  onViewProfile(): void {
    if (this.collaborator?.id) {
      this.viewProfile.emit(this.collaborator.id);
    }
  }
}
