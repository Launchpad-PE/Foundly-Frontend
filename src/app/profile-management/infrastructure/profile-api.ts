import { Injectable, inject } from '@angular/core';
import { BaseApi } from '../../shared/infrastructure/base-api';
import { ProfileApiEndpoint } from './profile-api-endpoin';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, throwError } from 'rxjs';
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
    return this.profileEndpoint
      .getProfileById(id)
      .pipe(
        map((response) => {
          console.log('📡 getProfile - Respuesta:', response);
          return this.assembler.toEntityFromResponse(response);
        }),
        catchError((error) => {
          console.error('❌ getProfile - Error:', error);
          return throwError(() => error);
        })
      );
  }

  getProfileByUserId(userId: string): Observable<Profile> {
    console.log('📡 Profile API: Solicitando perfil para userId:', userId);
    return this.profileEndpoint
      .getByUserId(userId)
      .pipe(
        map((response) => {
          console.log('📡 Profile API: Respuesta recibida:', response);
          if (!response || !response.profile) {
            console.warn('⚠️ Profile API: Respuesta sin perfil');
            throw new Error('Perfil no encontrado');
          }
          const entity = this.assembler.toEntityFromResponse(response);
          console.log('📡 Profile API: Entidad convertida:', entity);
          return entity;
        }),
        catchError((error) => {
          console.error('❌ Profile API - Error completo:', error);
          if (error.status === 404) {
            console.log('📡 Profile API: Perfil no encontrado (404)');
          }
          return throwError(() => error);
        })
      );
  }

  createProfile(profile: Profile): Observable<Profile> {
    return this.profileEndpoint
      .createProfile(profile)
      .pipe(
        map((response) => {
          console.log('📡 createProfile - Respuesta:', response);
          return this.assembler.toEntityFromResponse(response);
        }),
        catchError((error) => {
          console.error('❌ createProfile - Error:', error);
          return throwError(() => error);
        })
      );
  }

  updateProfile(profile: Profile): Observable<Profile> {
    return this.profileEndpoint
      .updateProfile(profile.id!, profile)
      .pipe(
        map((response) => {
          console.log('📡 updateProfile - Respuesta:', response);
          return this.assembler.toEntityFromResponse(response);
        }),
        catchError((error) => {
          console.error('❌ updateProfile - Error:', error);
          return throwError(() => error);
        })
      );
  }

  patchProfile(id: string, partialData: Partial<Profile>): Observable<Profile> {
    const resourcePartial: any = {};
    if (partialData.username !== undefined) resourcePartial.username = partialData.username;
    if (partialData.avatar !== undefined) resourcePartial.avatar = partialData.avatar;
    if (partialData.bio !== undefined) resourcePartial.bio = partialData.bio;
    if (partialData.role !== undefined) resourcePartial.role = partialData.role;
    if (partialData.skills !== undefined) resourcePartial.skills = partialData.skills;
    if ((partialData as any).favoriteProjectIds !== undefined)
      resourcePartial.favoriteProjectIds = (partialData as any).favoriteProjectIds;
    if (partialData.isComplete !== undefined) resourcePartial.isComplete = partialData.isComplete;

    return this.profileEndpoint
      .patchProfile(id, resourcePartial)
      .pipe(
        map((response) => {
          console.log('📡 patchProfile - Respuesta:', response);
          return this.assembler.toEntityFromResponse(response);
        }),
        catchError((error) => {
          console.error('❌ patchProfile - Error:', error);
          return throwError(() => error);
        })
      );
  }

  deleteProfile(id: string): Observable<void> {
    return this.profileEndpoint.deleteProfile(id);
  }

  // ─── Skills ───────────────────────────────────────────────────

  addSkill(profileId: string, skill: string): Observable<Profile> {
    return this.profileEndpoint
      .addSkill(profileId, skill)
      .pipe(
        map((response) => {
          console.log('📡 addSkill - Respuesta:', response);
          return this.assembler.toEntityFromResponse(response);
        }),
        catchError((error) => {
          console.error('❌ addSkill - Error:', error);
          return throwError(() => error);
        })
      );
  }

  removeSkill(profileId: string, skill: string): Observable<Profile> {
    return this.profileEndpoint
      .removeSkill(profileId, skill)
      .pipe(
        map((response) => {
          console.log('📡 removeSkill - Respuesta:', response);
          return this.assembler.toEntityFromResponse(response);
        }),
        catchError((error) => {
          console.error('❌ removeSkill - Error:', error);
          return throwError(() => error);
        })
      );
  }

  // ─── Experiences ──────────────────────────────────────────────

  addExperience(profileId: string, experience: any): Observable<Profile> {
    return this.profileEndpoint
      .addExperience(profileId, experience)
      .pipe(
        map((response) => {
          console.log('📡 addExperience - Respuesta:', response);
          return this.assembler.toEntityFromResponse(response);
        }),
        catchError((error) => {
          console.error('❌ addExperience - Error:', error);
          return throwError(() => error);
        })
      );
  }

  removeExperience(profileId: string, experienceId: string): Observable<Profile> {
    return this.profileEndpoint
      .removeExperience(profileId, experienceId)
      .pipe(
        map((response) => {
          console.log('📡 removeExperience - Respuesta:', response);
          return this.assembler.toEntityFromResponse(response);
        }),
        catchError((error) => {
          console.error('❌ removeExperience - Error:', error);
          return throwError(() => error);
        })
      );
  }

  setExperiences(profileId: string, experiences: any[]): Observable<Profile> {
    return this.profileEndpoint
      .setExperiences(profileId, experiences)
      .pipe(
        map((response) => {
          console.log('📡 setExperiences - Respuesta:', response);
          return this.assembler.toEntityFromResponse(response);
        }),
        catchError((error) => {
          console.error('❌ setExperiences - Error:', error);
          return throwError(() => error);
        })
      );
  }

  // ─── Favorites ────────────────────────────────────────────────

  addFavorite(profileId: string, projectId: string): Observable<Profile> {
    return this.profileEndpoint
      .addFavorite(profileId, projectId)
      .pipe(
        map((response) => {
          console.log('📡 addFavorite - Respuesta:', response);
          return this.assembler.toEntityFromResponse(response);
        }),
        catchError((error) => {
          console.error('❌ addFavorite - Error:', error);
          return throwError(() => error);
        })
      );
  }

  removeFavorite(profileId: string, projectId: string): Observable<Profile> {
    return this.profileEndpoint
      .removeFavorite(profileId, projectId)
      .pipe(
        map((response) => {
          console.log('📡 removeFavorite - Respuesta:', response);
          return this.assembler.toEntityFromResponse(response);
        }),
        catchError((error) => {
          console.error('❌ removeFavorite - Error:', error);
          return throwError(() => error);
        })
      );
  }

  getAllProfiles(): Observable<Profile[]> {
    return this.profileEndpoint
      .getAllProfiles()
      .pipe(
        map((response) => {
          console.log('📡 getAllProfiles - Respuesta:', response);
          return this.assembler.toEntitiesFromResponse(response);
        }),
        catchError((error) => {
          console.error('❌ getAllProfiles - Error:', error);
          return throwError(() => error);
        })
      );
  }
}
