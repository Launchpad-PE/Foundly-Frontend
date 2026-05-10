import { Component, Input } from '@angular/core';

export interface Collaborator {
  id: string;
  name: string;
  role: string;
  avatar?: string;
}

@Component({
  selector: 'app-collaborator-card',
  standalone: true,
  templateUrl: './collaborator-card.html',  // ✅
  styleUrls: ['./collaborator-card.css']    // ✅ era .scss
})
export class CollaboratorCardComponent {
  @Input() collaborator!: Collaborator;
}
