/**
 * A comment left by one user (author) on another user's profile (target).
 * Mirrors the backend CommentResponse payload.
 */
export interface Comment {
  id: number;
  authorId: number;
  targetUserId: number;
  content: string;
  createdAt: string;
}
