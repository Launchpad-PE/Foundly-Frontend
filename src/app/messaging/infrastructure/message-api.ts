import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DirectMessage } from '../domain/model/direct-message.entity';
import { Conversation } from '../domain/model/conversation.entity';

/**
 * REST client for direct messaging. The JWT is added by the global authInterceptor.
 */
@Injectable({ providedIn: 'root' })
export class MessageApi {
  private http = inject(HttpClient);
  private readonly baseUrl = environment.platformProviderApiBaseUrl;
  private readonly path = '/api/v1/messages';

  /** Sends a message; the backend also pushes it over WebSocket to both participants. */
  sendMessage(recipientId: number, content: string): Observable<DirectMessage> {
    return this.http.post<DirectMessage>(`${this.baseUrl}${this.path}`, { recipientId, content });
  }

  /** Full message history with another user, oldest first. */
  getConversation(otherUserId: number): Observable<DirectMessage[]> {
    return this.http.get<DirectMessage[]>(`${this.baseUrl}${this.path}/${otherUserId}`);
  }

  /** My conversations (one entry per person, with the last message). */
  getConversations(): Observable<Conversation[]> {
    return this.http.get<Conversation[]>(`${this.baseUrl}${this.path}/conversations`);
  }
}
