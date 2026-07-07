/**
 * A direct (1-to-1) message. Mirrors the backend DirectMessageResponse,
 * also the payload pushed over WebSocket.
 */
export interface DirectMessage {
  id: number;
  senderId: number;
  recipientId: number;
  content: string;
  createdAt: string;
}
