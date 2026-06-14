import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Comment } from '../domain/model/comment.entity';

/**
 * HTTP service for profile comments. Talks to the real backend
 * (POST/GET /api/v1/users/{userId}/comments). The JWT is added
 * automatically by the global authInterceptor.
 */
@Injectable({ providedIn: 'root' })
export class CommentApi {
  private http = inject(HttpClient);
  private readonly baseUrl = environment.platformProviderApiBaseUrl;
  private readonly usersPath = environment.platformUserEndpointPath;

  /** Comments left on a user's profile, newest first. */
  getComments(userId: string | number): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.baseUrl}${this.usersPath}/${userId}/comments`);
  }

  /** Leave a comment on a user's profile. */
  createComment(userId: string | number, authorId: number, content: string): Observable<Comment> {
    return this.http.post<Comment>(
      `${this.baseUrl}${this.usersPath}/${userId}/comments`,
      { authorId, content },
    );
  }
}
