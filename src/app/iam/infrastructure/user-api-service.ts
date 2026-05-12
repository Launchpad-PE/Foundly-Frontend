import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
}

export interface LoginResponse {
  id: number;
  fullName: string;
  email: string;
  token: string;
}

export interface RegisterResponse {
  id: number;
  fullName: string;
  email: string;
}

@Injectable({ providedIn: 'root' })
export class UsersApi {
  private http = inject(HttpClient);
  private apiUrl = environment.platformProviderApiBaseUrl;

  register(data: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.apiUrl}/users`, data);
  }

  authenticate(email: string, password: string): Observable<LoginResponse> {
    return this.http.get<any[]>(`${this.apiUrl}/users?email=${email}&password=${password}`).pipe(
      map(users => {
        console.log('🔍 Users found:', users);
        if (users && users.length > 0) {
          const user = users[0];
          return {
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            token: `fake-jwt-token-${user.id}-${Date.now()}`
          };
        }
        throw new Error('Credenciales incorrectas');
      })
    );
  }
}
