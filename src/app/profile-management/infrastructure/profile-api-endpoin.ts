import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-endpoint';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Profile } from '../domain/entities/profile.entity';
import { ProfileResource, ProfileResponse, ProfilesResponse } from './profile-response';
import { ProfileAssembler } from './profile-assembler';

export class ProfileApiEndpoint extends BaseApiEndpoint<Profile, ProfileResource, ProfileResponse | ProfilesResponse, ProfileAssembler> {

  private readonly profilesUrl: string;

  constructor(http: HttpClient) {
    super(http, `${environment.platformProviderApiBaseUrl}${environment.platformProfileEndpointPath}`, new ProfileAssembler());
    this.profilesUrl = `${environment.platformProviderApiBaseUrl}${environment.platformProfileEndpointPath}`;
  }

  /**
   * Get profile by user ID
   */
  getByUserId(userId: string) {
    return this.http.get<ProfileResponse>(`${this.profilesUrl}/user/${userId}`);
  }

  /**
   * Update profile partially
   */
  patch(id: string, partialData: Partial<ProfileResource>) {
    return this.http.patch<ProfileResponse>(`${this.profilesUrl}/${id}`, partialData);
  }

  /**
   * Add skill to profile
   */
  addSkill(profileId: string, skill: string) {
    return this.http.post<ProfileResponse>(`${this.profilesUrl}/${profileId}/skills`, { skill });
  }

  /**
   * Remove skill from profile
   */
  removeSkill(profileId: string, skill: string) {
    return this.http.delete<ProfileResponse>(`${this.profilesUrl}/${profileId}/skills/${encodeURIComponent(skill)}`);
  }

  /**
   * Add experience to profile
   */
  addExperience(profileId: string, experience: any) {
    return this.http.post<ProfileResponse>(`${this.profilesUrl}/${profileId}/experiences`, experience);
  }

  /**
   * Remove experience from profile
   */
  removeExperience(profileId: string, experienceId: string) {
    return this.http.delete<ProfileResponse>(`${this.profilesUrl}/${profileId}/experiences/${experienceId}`);
  }

  /**
   * Upload avatar
   */
  uploadAvatar(profileId: string, file: File) {
    const formData = new FormData();
    formData.append('avatar', file);
    return this.http.post<{ avatarUrl: string }>(`${this.profilesUrl}/${profileId}/avatar`, formData);
  }
}
