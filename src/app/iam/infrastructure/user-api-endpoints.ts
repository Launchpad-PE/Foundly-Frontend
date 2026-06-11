import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { UserApiData } from './user.assembler';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UsersApi {
  private readonly baseUrl = environment.platformProviderApiBaseUrl;
  private readonly endpointPath = environment.platformUserEndpointPath;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    });
  }

  /**
   * Authenticate user with backend
   */
  authenticate(email: string, password: string): Observable<any> {
    return this.http
      .post(`${this.baseUrl}/api/v1/authentication/sign-in`, { email, password }, { headers: this.getHeaders() })
      .pipe(tap((res) => console.log(' API Response:', res)));
  }

  /**
   * Register a new user
   */
  register(userData: UserApiData): Observable<any> {
    return this.http
      .post(`${this.baseUrl}/api/v1/authentication/sign-up`, userData, { headers: this.getHeaders() })
      .pipe(tap((res) => console.log(' Register Response:', res)));
  }

  /**
   * Get user by email
   */
  getByEmail(email: string): Observable<any> {
    return this.http.get(`${this.baseUrl}${this.endpointPath}/email/${encodeURIComponent(email)}`, {
      headers: this.getHeaders(),
    });
  }

  /**
   * Update user profile
   */
  updateProfile(id: string, userData: Partial<UserApiData>): Observable<any> {
    return this.http.put(`${this.baseUrl}${this.endpointPath}/${id}`, userData, {
      headers: this.getHeaders(),
    });
  }

}
