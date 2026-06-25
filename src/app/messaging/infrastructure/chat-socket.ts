import { Injectable } from '@angular/core';
import { Client, IMessage } from '@stomp/stompjs';
import { Subject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DirectMessage } from '../domain/model/direct-message.entity';

/**
 * STOMP-over-WebSocket client for real-time direct messages.
 *
 * <p>Connects to {@code /ws} with the JWT in the CONNECT frame, subscribes to
 * {@code /user/queue/messages} and emits each incoming message on {@link incoming$}.
 * Sending is done over REST (see MessageApi); this service only receives.</p>
 */
@Injectable({ providedIn: 'root' })
export class ChatSocket {
  private client: Client | null = null;
  private readonly incomingSubject = new Subject<DirectMessage>();

  /** Messages arriving in real time. */
  readonly incoming$ = this.incomingSubject.asObservable();

  connect(): void {
    if (this.client?.active) return;

    const token = localStorage.getItem('authToken') ?? '';
    const wsUrl = environment.platformProviderApiBaseUrl.replace(/^http/, 'ws') + '/ws';

    this.client = new Client({
      brokerURL: wsUrl,
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 4000,
      onConnect: () => {
        this.client?.subscribe('/user/queue/messages', (frame: IMessage) => {
          try {
            this.incomingSubject.next(JSON.parse(frame.body) as DirectMessage);
          } catch (error) {
            console.error('Mensaje WS no parseable', error);
          }
        });
      },
      onStompError: (frame) => console.error('STOMP error:', frame.headers['message']),
    });

    this.client.activate();
  }

  disconnect(): void {
    this.client?.deactivate();
    this.client = null;
  }
}
