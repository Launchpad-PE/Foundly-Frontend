import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Profile } from '../../../../../profile-management/domain/entities/profile.entity';
import { TranslatePipe } from '@ngx-translate/core';

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
  imports: [CommonModule, TranslatePipe]
})
export class CollaboratorCardComponent {
  @Input() collaborator!: Profile;
  @Output() viewProfile = new EventEmitter<string>();

  get avatarGradient(): string {
    // ✅ Solución: usar optional chaining y fallback
    const id = this.collaborator?.id || '';
    const index = id.length % AVATAR_GRADIENTS.length;
    return AVATAR_GRADIENTS[index];
  }

  get initials(): string {
    // ✅ Solución: verificar que username existe
    const username = this.collaborator?.username || '';
    return username
      .split(' ')
      .slice(0, 2)
      .map(n => n[0] || '')
      .join('')
      .toUpperCase() || '?';
  }

  get displayName(): string {
    // ✅ Solución: fallback si no hay username
    return this.collaborator?.username || 'Usuario';
  }

  onViewProfile(): void {
    // ✅ Solución: verificar que id existe antes de emitir
    if (this.collaborator?.id) {
      this.viewProfile.emit(this.collaborator.id);
    }
  }
}
