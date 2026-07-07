import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { MessageApi } from '../infrastructure/message-api';
import { ChatSocket } from '../infrastructure/chat-socket';
import { DirectMessage } from '../domain/model/direct-message.entity';
import { Conversation } from '../domain/model/conversation.entity';
import { UserStore } from '../../iam/application/user.store';

/**
 * Reactive store for direct messaging. Holds the conversation list and the
 * active thread as signals, keeps them in sync with real-time WebSocket events.
 */
@Injectable({ providedIn: 'root' })
export class ChatStore {
  private api = inject(MessageApi);
  private socket = inject(ChatSocket);
  private userStore = inject(UserStore);

  readonly conversations = signal<Conversation[]>([]);
  readonly messages = signal<DirectMessage[]>([]);
  readonly activeUserId = signal<number | null>(null);
  readonly loadingThread = signal(false);

  private started = false;

  get myId(): number | null {
    const id = this.userStore.currentUser()?.id;
    return id != null ? Number(id) : null;
  }

  /** Connects the socket (once) and loads the conversation list. */
  async start(): Promise<void> {
    if (!this.started) {
      this.started = true;
      this.socket.connect();
      this.socket.incoming$.subscribe((msg) => this.onIncoming(msg));
    }
    await this.loadConversations();
  }

  async loadConversations(): Promise<void> {
    try {
      this.conversations.set(await firstValueFrom(this.api.getConversations()));
    } catch (error) {
      console.error('Error cargando conversaciones', error);
    }
  }

  async openConversation(otherUserId: number): Promise<void> {
    this.activeUserId.set(otherUserId);
    this.loadingThread.set(true);
    try {
      this.messages.set(await firstValueFrom(this.api.getConversation(otherUserId)));
    } catch (error) {
      console.error('Error cargando el hilo', error);
      this.messages.set([]);
    } finally {
      this.loadingThread.set(false);
    }
  }

  async send(content: string): Promise<void> {
    const to = this.activeUserId();
    const text = content.trim();

    console.log('📤 ChatStore.send - to:', to, 'text:', text);

    if (!to || !text) {
      console.warn('⚠️ No se puede enviar: destinatario o contenido vacío');
      return;
    }

    try {
      const saved = await firstValueFrom(this.api.sendMessage(to, text));
      console.log('✅ Mensaje enviado:', saved);
      this.appendIfNew(saved);
      this.bumpConversation(saved);
    } catch (error) {
      console.error('❌ Error enviando mensaje:', error);
      throw error;
    }
  }
  // ── tiempo real ───────────────────────────────────────────────

  private onIncoming(msg: DirectMessage): void {
    if (this.counterpart(msg) === this.activeUserId()) {
      this.appendIfNew(msg);
    }
    this.bumpConversation(msg);
  }

  private appendIfNew(msg: DirectMessage): void {
    if (this.messages().some((m) => m.id === msg.id)) return;
    this.messages.set([...this.messages(), msg]);
  }

  /** Moves (or inserts) the conversation to the top with the latest message. */
  private bumpConversation(msg: DirectMessage): void {
    const other = this.counterpart(msg);
    const updated: Conversation = {
      otherUserId: other,
      lastMessage: msg.content,
      lastMessageAt: msg.createdAt,
      lastMessageFromMe: msg.senderId === this.myId,
    };
    const rest = this.conversations().filter((c) => c.otherUserId !== other);
    this.conversations.set([updated, ...rest]);
  }

  private counterpart(msg: DirectMessage): number {
    return msg.senderId === this.myId ? msg.recipientId : msg.senderId;
  }
}
