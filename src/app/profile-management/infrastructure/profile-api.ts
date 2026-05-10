import { Injectable, inject } from '@angular/core';
import { BaseApi } from '../../shared/infrastructure/base-api';
import { ProfileApiEndpoint } from './profile-api-endpoin';
import { HttpClient } from '@angular/common/http';
import { Observable, firstValueFrom } from 'rxjs';
import { Profile } from '../domain/entities/profile.entity';

@Injectable({ providedIn: 'root' })
export class ProfileApi extends BaseApi {
  private readonly profileEndpoint: ProfileApiEndpoint;

  constructor(httpClient: HttpClient) {
    super();
    this.profileEndpoint = new ProfileApiEndpoint(httpClient);
  }

  // ─── Profile CRUD ─────────────────────────────────────────────

  getProfile(id: string): Observable<Profile> {
    return this.profileEndpoint.getById(id);
  }

  getProfileByUserId(userId: string): Observable<Profile> {
    return this.profileEndpoint.getByUserId(userId);
  }

  createProfile(profile: Profile): Observable<Profile> {
    return this.profileEndpoint.create(profile);
  }

  updateProfile(profile: Profile): Observable<Profile> {
    return this.profileEndpoint.update(profile, profile.id!);
  }

  patchProfile(id: string, partialData: Partial<Profile>): Observable<Profile> {
    // Convertir partial Profile a Partial<ProfileResource>
    const resourcePartial: any = {};
    if (partialData.username !== undefined) resourcePartial.username = partialData.username;
    if (partialData.avatar !== undefined) resourcePartial.avatar = partialData.avatar;
    if (partialData.bio !== undefined) resourcePartial.bio = partialData.bio;
    if (partialData.role !== undefined) resourcePartial.role = partialData.role;
    if (partialData.skills !== undefined) resourcePartial.skills = partialData.skills;
    if (partialData.isComplete !== undefined) resourcePartial.isComplete = partialData.isComplete;

    return this.profileEndpoint.patch(id, resourcePartial);
  }

  deleteProfile(id: string): Observable<void> {
    return this.profileEndpoint.delete(id);
  }

  // ─── Skills ───────────────────────────────────────────────────

  addSkill(profileId: string, skill: string): Observable<Profile> {
    return this.profileEndpoint.addSkill(profileId, skill);
  }

  removeSkill(profileId: string, skill: string): Observable<Profile> {
    return this.profileEndpoint.removeSkill(profileId, skill);
  }

  // ─── Experiences ──────────────────────────────────────────────

  addExperience(profileId: string, experience: any): Observable<Profile> {
    return this.profileEndpoint.addExperience(profileId, experience);
  }

  removeExperience(profileId: string, experienceId: string): Observable<Profile> {
    return this.profileEndpoint.removeExperience(profileId, experienceId);
  }

}
