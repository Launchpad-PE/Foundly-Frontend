import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-endpoint';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Profile } from '../domain/entities/profile.entity';
import { ProfileResource, ProfileResponse, ProfilesResponse } from './profile-response';
import { ProfileAssembler } from './profile-assembler';
import { Observable, map } from 'rxjs';

export class ProfileApiEndpoint extends BaseApiEndpoint<Profile, ProfileResource, ProfileResponse | ProfilesResponse, ProfileAssembler> {

  private readonly profilesUrl: string;

  constructor(http: HttpClient) {
    super(http, `${environment.platformProviderApiBaseUrl}${environment.platformProfileEndpointPath}`, new ProfileAssembler());
    this.profilesUrl = `${environment.platformProviderApiBaseUrl}${environment.platformProfileEndpointPath}`;
  }

  /**
   * Get profile by user ID - returns Profile directly
   */
  getByUserId(userId: string): Observable<Profile> {
    return this.http.get<ProfileResponse>(`${this.profilesUrl}/user/${userId}`).pipe(
      map(response => this.assembler.toEntityFromResponse(response))
    );
  }

  /**
   * Update profile partially - returns Profile directly
   */
  patch(id: string, partialData: Partial<ProfileResource>): Observable<Profile> {
    return this.http.patch<ProfileResponse>(`${this.profilesUrl}/${id}`, partialData).pipe(
      map(response => this.assembler.toEntityFromResponse(response))
    );
  }

  /**
   * Add skill to profile - returns Profile directly
   */
  addSkill(profileId: string, skill: string): Observable<Profile> {
    return this.http.post<ProfileResponse>(`${this.profilesUrl}/${profileId}/skills`, { skill }).pipe(
      map(response => this.assembler.toEntityFromResponse(response))
    );
  }

  /**
   * Remove skill from profile - returns Profile directly
   */
  removeSkill(profileId: string, skill: string): Observable<Profile> {
    return this.http.delete<ProfileResponse>(`${this.profilesUrl}/${profileId}/skills/${encodeURIComponent(skill)}`).pipe(
      map(response => this.assembler.toEntityFromResponse(response))
    );
  }

  /**
   * Add experience to profile - returns Profile directly
   */
  addExperience(profileId: string, experience: any): Observable<Profile> {
    return this.http.post<ProfileResponse>(`${this.profilesUrl}/${profileId}/experiences`, experience).pipe(
      map(response => this.assembler.toEntityFromResponse(response))
    );
  }

  /**
   * Remove experience from profile - returns Profile directly
   */
  removeExperience(profileId: string, experienceId: string): Observable<Profile> {
    return this.http.delete<ProfileResponse>(`${this.profilesUrl}/${profileId}/experiences/${experienceId}`).pipe(
      map(response => this.assembler.toEntityFromResponse(response))
    );
  }

}
