// profile-management/infrastructure/profile-api-endpoin.ts
import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-endpoint';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Profile } from '../domain/entities/profile.entity';
import { ProfileResource, ProfileResponse, ProfilesResponse } from './profile-response';
import { ProfileAssembler } from './profile-assembler';
import { catchError, Observable, throwError } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

export class ProfileApiEndpoint extends BaseApiEndpoint<
  Profile,
  ProfileResource,
  ProfileResponse | ProfilesResponse,
  ProfileAssembler
> {
  private readonly profilesUrl: string;

  constructor(http: HttpClient) {
    super(
      http,
      `${environment.platformProviderApiBaseUrl}${environment.platformProfileEndpointPath}`,
      new ProfileAssembler(),
    );
    this.profilesUrl = `${environment.platformProviderApiBaseUrl}${environment.platformProfileEndpointPath}`;
  }

  /**
   * Get profile by ID
   */
  getProfileById(id: string): Observable<ProfileResponse> {
    return this.http
      .get<ProfileResource>(`${this.profilesUrl}/${id}`)
      .pipe(map((profile) => ({ profile }) as ProfileResponse));
  }

  /**
   * Get profile by user ID
   */
  getByUserId(userId: string): Observable<ProfileResponse> {
    console.log('📡 ProfileApiEndpoint: Solicitando perfil para userId:', userId);
    return this.http
      .get<ProfileResource>(`${this.profilesUrl}/user/${userId}`)
      .pipe(
        map((profile) => {
          console.log('📡 ProfileApiEndpoint: Perfil recibido:', profile);
          if (!profile) {
            console.warn('📡 ProfileApiEndpoint: Perfil vacío');
            throw new Error('Perfil no encontrado');
          }
          return { profile } as ProfileResponse;
        }),
        catchError((error) => {
          console.error('📡 ProfileApiEndpoint - Error:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Create profile
   */
  createProfile(profile: Profile): Observable<ProfileResponse> {
    const resource = this.assembler.toResourceFromEntity(profile);
    return this.http
      .post<ProfileResource>(this.profilesUrl, resource)
      .pipe(map((created) => ({ profile: created }) as ProfileResponse));
  }

  /**
   * Update profile
   */
  updateProfile(id: string, profile: Profile): Observable<ProfileResponse> {
    const resource = this.assembler.toResourceFromEntity(profile);
    return this.http
      .put<ProfileResource>(`${this.profilesUrl}/${id}`, resource)
      .pipe(map((updated) => ({ profile: updated }) as ProfileResponse));
  }

  /**
   * Patch profile (partial update)
   */
  patchProfile(id: string, partialData: Partial<ProfileResource>): Observable<ProfileResponse> {
    return this.http
      .patch<ProfileResource>(`${this.profilesUrl}/${id}`, partialData)
      .pipe(map((updated) => ({ profile: updated }) as ProfileResponse));
  }

  /**
   * Delete profile
   */
  deleteProfile(id: string): Observable<void> {
    return this.http.delete<void>(`${this.profilesUrl}/${id}`);
  }

  /**
   * Add skill to profile
   */
  addSkill(profileId: string, skill: string): Observable<ProfileResponse> {
    return this.http.get<ProfileResource>(`${this.profilesUrl}/${profileId}`).pipe(
      switchMap((profile) => {
        const skills = [...(profile.skills || []), skill];
        return this.http.patch<ProfileResource>(`${this.profilesUrl}/${profileId}`, { skills });
      }),
      map((response) => ({ profile: response }) as ProfileResponse),
    );
  }

  /**
   * Remove skill from profile
   */
  removeSkill(profileId: string, skill: string): Observable<ProfileResponse> {
    return this.http.get<ProfileResource>(`${this.profilesUrl}/${profileId}`).pipe(
      switchMap((profile) => {
        const skills = (profile.skills || []).filter((s) => s !== skill);
        return this.http.patch<ProfileResource>(`${this.profilesUrl}/${profileId}`, { skills });
      }),
      map((response) => ({ profile: response }) as ProfileResponse),
    );
  }

  /**
   * Add experience to profile
   */
  addExperience(profileId: string, experience: any): Observable<ProfileResponse> {
    return this.http.get<ProfileResource>(`${this.profilesUrl}/${profileId}`).pipe(
      switchMap((profile) => {
        const experiences = [...(profile.experiences || []), experience];
        return this.http.patch<ProfileResource>(`${this.profilesUrl}/${profileId}`, {
          experiences,
        });
      }),
      map((response) => ({ profile: response }) as ProfileResponse),
    );
  }

  /**
   * Remove experience from profile
   */
  removeExperience(profileId: string, experienceId: string): Observable<ProfileResponse> {
    return this.http.get<ProfileResource>(`${this.profilesUrl}/${profileId}`).pipe(
      switchMap((profile) => {
        const experiences = (profile.experiences || []).filter((e) => e.id !== experienceId);
        return this.http.patch<ProfileResource>(`${this.profilesUrl}/${profileId}`, {
          experiences,
        });
      }),
      map((response) => ({ profile: response }) as ProfileResponse),
    );
  }

  /**
   * Reemplaza el array completo de experiencias (PATCH directo)
   */
  setExperiences(profileId: string, experiences: any[]): Observable<ProfileResponse> {
    return this.http
      .patch<ProfileResource>(`${this.profilesUrl}/${profileId}`, { experiences })
      .pipe(map((response) => ({ profile: response }) as ProfileResponse));
  }

  /**
   * Get all profiles
   */
  getAllProfiles(): Observable<ProfilesResponse> {
    return this.http
      .get<ProfileResource[]>(this.profilesUrl)
      .pipe(map((profiles) => ({ profiles }) as ProfilesResponse));
  }

  /**
   * Add project to favorites
   */
  addFavorite(profileId: string, projectId: string): Observable<ProfileResponse> {
    const id = projectId.toString();
    console.log(`📡 [Endpoint] addFavorite - profileId: ${profileId}, projectId: ${id}`);

    return this.http.get<ProfileResource>(`${this.profilesUrl}/${profileId}`).pipe(
      switchMap((profile) => {
        console.log('📡 [Endpoint] Perfil obtenido:', profile);
        const current = profile.favoriteProjectIds || [];
        const favoriteProjectIds = current.includes(id) ? current : [...current, id];
        console.log('📡 [Endpoint] Nuevos favoritos:', favoriteProjectIds);

        return this.http.patch<ProfileResource>(`${this.profilesUrl}/${profileId}`, {
          favoriteProjectIds,
        });
      }),
      map((response) => {
        console.log('📡 [Endpoint] Response PATCH:', response);
        return { profile: response } as ProfileResponse;
      }),
      catchError((error) => {
        console.error('❌ [Endpoint] Error en addFavorite:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Remove project from favorites
   */
  removeFavorite(profileId: string, projectId: string): Observable<ProfileResponse> {
    const id = projectId.toString();
    console.log(`📡 [Endpoint] removeFavorite - profileId: ${profileId}, projectId: ${id}`);

    return this.http.get<ProfileResource>(`${this.profilesUrl}/${profileId}`).pipe(
      switchMap((profile) => {
        console.log('📡 [Endpoint] Perfil obtenido:', profile);
        const favoriteProjectIds = (profile.favoriteProjectIds || []).filter((f) => f !== id);
        console.log('📡 [Endpoint] Favoritos después de quitar:', favoriteProjectIds);

        return this.http.patch<ProfileResource>(`${this.profilesUrl}/${profileId}`, {
          favoriteProjectIds,
        });
      }),
      map((response) => {
        console.log('📡 [Endpoint] Response PATCH:', response);
        return { profile: response } as ProfileResponse;
      }),
      catchError((error) => {
        console.error('❌ [Endpoint] Error en removeFavorite:', error);
        return throwError(() => error);
      })
    );
  }
}
