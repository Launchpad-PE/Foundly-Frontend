/**
 * Summary of a 1-to-1 conversation (the other participant + the last message).
 * Mirrors the backend ConversationResponse.
 */
export interface Conversation {
  otherUserId: number;
  lastMessage: string;
  lastMessageAt: string;
  lastMessageFromMe: boolean;
}
