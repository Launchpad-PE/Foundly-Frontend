import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  roles: string[];
}

// Matches backend AuthenticatedUserResource: { id, username, token }
export interface LoginResponse {
  id: number;
  username: string;
  token: string;
}

// Matches backend UserResource: { id, username, roles }
export interface RegisterResponse {
  id: number;
  username: string;
  roles: string[];
}

@Injectable({ providedIn: 'root' })
export class UsersApi {
  private http = inject(HttpClient);
  private baseUrl = environment.platformProviderApiBaseUrl;

  register(data: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.baseUrl}/api/v1/authentication/sign-up`, data);
  }

  authenticate(username: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${this.baseUrl}/api/v1/authentication/sign-in`,
      { username, password }
    );
  }
}
