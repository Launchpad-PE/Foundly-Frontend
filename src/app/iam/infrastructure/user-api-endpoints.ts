import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { UserApiData } from './user.assembler';

const BASE_URL = 'https://json-server-qmbj.onrender.com'; // Replace with your API base URL

@Injectable({ providedIn: 'root' })
export class UsersApi {
  private readonly endpointPath = '/users';

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
      .post(`${BASE_URL}/authentication/sign-in`, { email, password }, { headers: this.getHeaders() })
      .pipe(tap((res) => console.log(' API Response:', res)));
  }

  /**
   * Register a new user
   */
  register(userData: UserApiData): Observable<any> {
    return this.http
      .post(`${BASE_URL}${this.endpointPath}`, userData, { headers: this.getHeaders() })
      .pipe(tap((res) => console.log(' Register Response:', res)));
  }

  /**
   * Get user by email
   */
  getByEmail(email: string): Observable<any> {
    return this.http.get(`${BASE_URL}${this.endpointPath}?email=${encodeURIComponent(email)}`, {
      headers: this.getHeaders(),
    });
  }

  /**
   * Update user profile
   */
  updateProfile(id: string, userData: Partial<UserApiData>): Observable<any> {
    return this.http.put(`${BASE_URL}${this.endpointPath}/${id}`, userData, {
      headers: this.getHeaders(),
    });
  }

}
