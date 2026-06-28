import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';

export interface ProfileConfigData {
  username: string;
  avatar: string | null;
}

@Component({
  selector: 'app-profile-config',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './profile-config.html',
  styleUrls: ['./profile-config.css']
})
export class ProfileConfigComponent implements OnInit {
  @Input() modelValue: ProfileConfigData = { username: '', avatar: null };
  @Output() modelValueChange = new EventEmitter<ProfileConfigData>();
  @Output() next = new EventEmitter<void>();

  username = '';

  ngOnInit(): void {
    this.username = this.modelValue.username || '';
  }

  emitUpdate(): void {
    this.modelValueChange.emit({ username: this.username, avatar: this.modelValue.avatar });
  }

  onSubmit(): void {
    if (this.username.trim()) {
      this.next.emit();
    }
  }
}
