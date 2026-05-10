import { Injectable, inject } from '@angular/core';
import { BaseApi } from '../../shared/infrastructure/base-api';
import { ProfileApiEndpoint } from './profile-api-endpoin';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Profile } from '../domain/entities/profile.entity';
import { ProfileAssembler } from './profile-assembler';

@Injectable({ providedIn: 'root' })
export class ProfileApi extends BaseApi {
  private readonly profileEndpoint: ProfileApiEndpoint;
  private readonly assembler = new ProfileAssembler();

  constructor(httpClient: HttpClient) {
    super();
    this.profileEndpoint = new ProfileApiEndpoint(httpClient);
  }

  // ─── Profile CRUD ─────────────────────────────────────────────

  getProfile(id: string): Observable<Profile> {
    return this.profileEndpoint.getProfileById(id).pipe(
      map(response => this.assembler.toEntityFromResponse(response))
    );
  }

  getProfileByUserId(userId: string): Observable<Profile> {
    return this.profileEndpoint.getByUserId(userId).pipe(
      map(response => this.assembler.toEntityFromResponse(response))
    );
  }

  createProfile(profile: Profile): Observable<Profile> {
    return this.profileEndpoint.createProfile(profile).pipe(
      map(response => this.assembler.toEntityFromResponse(response))
    );
  }

  updateProfile(profile: Profile): Observable<Profile> {
    return this.profileEndpoint.updateProfile(profile.id!, profile).pipe(
      map(response => this.assembler.toEntityFromResponse(response))
    );
  }

  patchProfile(id: string, partialData: Partial<Profile>): Observable<Profile> {
    const resourcePartial: any = {};
    if (partialData.username !== undefined) resourcePartial.username = partialData.username;
    if (partialData.avatar !== undefined) resourcePartial.avatar = partialData.avatar;
    if (partialData.bio !== undefined) resourcePartial.bio = partialData.bio;
    if (partialData.role !== undefined) resourcePartial.role = partialData.role;
    if (partialData.skills !== undefined) resourcePartial.skills = partialData.skills;
    if (partialData.isComplete !== undefined) resourcePartial.isComplete = partialData.isComplete;

    return this.profileEndpoint.patchProfile(id, resourcePartial).pipe(
      map(response => this.assembler.toEntityFromResponse(response))
    );
  }

  deleteProfile(id: string): Observable<void> {
    return this.profileEndpoint.deleteProfile(id);
  }

  // ─── Skills ───────────────────────────────────────────────────

  addSkill(profileId: string, skill: string): Observable<Profile> {
    return this.profileEndpoint.addSkill(profileId, skill).pipe(
      map(response => this.assembler.toEntityFromResponse(response))
    );
  }

  removeSkill(profileId: string, skill: string): Observable<Profile> {
    return this.profileEndpoint.removeSkill(profileId, skill).pipe(
      map(response => this.assembler.toEntityFromResponse(response))
    );
  }

  // ─── Experiences ──────────────────────────────────────────────

  addExperience(profileId: string, experience: any): Observable<Profile> {
    return this.profileEndpoint.addExperience(profileId, experience).pipe(
      map(response => this.assembler.toEntityFromResponse(response))
    );
  }

  removeExperience(profileId: string, experienceId: string): Observable<Profile> {
    return this.profileEndpoint.removeExperience(profileId, experienceId).pipe(
      map(response => this.assembler.toEntityFromResponse(response))
    );
  }
}
