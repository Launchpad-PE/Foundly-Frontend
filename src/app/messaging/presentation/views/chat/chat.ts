import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ChatStore } from '../../../application/chat.store';
import { ProfileApi } from '../../../../profile-management/infrastructure/profile-api';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './chat.html',
  styleUrl: './chat.css',
})
export class ChatComponent implements OnInit {
  private chat = inject(ChatStore);
  private profileApi = inject(ProfileApi);
  private route = inject(ActivatedRoute);

  conversations = this.chat.conversations;
  messages = this.chat.messages;
  activeUserId = this.chat.activeUserId;
  loadingThread = this.chat.loadingThread;

  draft = '';
  names = signal<Record<number, string>>({});

  get myId(): number | null {
    return this.chat.myId;
  }

  async ngOnInit(): Promise<void> {
    await this.chat.start();
    await this.resolveNames();

    const to = this.route.snapshot.queryParamMap.get('to');
    if (to) {
      await this.open(Number(to));
    }
  }

  async open(userId: number): Promise<void> {
    await this.chat.openConversation(userId);
    await this.ensureName(userId);
  }

  async sendMessage(): Promise<void> {
    const text = this.draft.trim();
    if (!text) return;
    this.draft = '';
    await this.chat.send(text);
  }

  nameOf(userId: number): string {
    return this.names()[userId] ?? `Usuario ${userId}`;
  }

  initialOf(userId: number): string {
    return this.nameOf(userId).charAt(0).toUpperCase();
  }

  formatTime(iso: string): string {
    if (!iso) return '';
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  private async resolveNames(): Promise<void> {
    for (const conversation of this.conversations()) {
      await this.ensureName(conversation.otherUserId);
    }
  }

  /** Resolves a user's display name from their profile (fallback "Usuario {id}"). */
  private async ensureName(userId: number): Promise<void> {
    if (this.names()[userId]) return;
    try {
      const profile = await firstValueFrom(this.profileApi.getProfileByUserId(String(userId)));
      const name = profile?.username?.trim();
      if (name) {
        this.names.set({ ...this.names(), [userId]: name });
      }
    } catch {
      // se queda con el fallback "Usuario {id}"
    }
  }
}
