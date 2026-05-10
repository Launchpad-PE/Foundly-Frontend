import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { Profile } from '../domain/entities/profile.entity';
import { Experience } from '../domain/entities/experience.entity';
import { ProfileResource, ProfileResponse, ProfilesResponse } from './profile-response';
import { ExperienceResource } from './experience-response';

export class ProfileAssembler implements BaseAssembler<Profile, ProfileResource, ProfileResponse | ProfilesResponse> {

  /**
   * Convert response to entity (for single profile)
   */
  toEntityFromResponse(response: ProfileResponse): Profile {
    return this.toEntityFromResource(response.profile);
  }

  /**
   * Convert response to entities (for multiple profiles)
   */
  toEntitiesFromResponse(response: ProfilesResponse): Profile[] {
    return response.profiles.map(resource => this.toEntityFromResource(resource));
  }

  /**
   * Convert resource to entity
   */
  toEntityFromResource(resource: ProfileResource): Profile {
    const experiences = (resource.experiences || []).map(exp =>
      this.experienceFromResource(exp)
    );

    return new Profile({
      id: resource.id,
      userId: resource.userId,
      username: resource.username,
      avatar: resource.avatar,
      bio: resource.bio,
      role: resource.role,
      skills: resource.skills || [],
      experiences: experiences,
      isComplete: resource.isComplete,
      createdAt: resource.createdAt,
      updatedAt: resource.updatedAt,
    });
  }

  /**
   * Convert entity to resource (for create/update)
   */
  toResourceFromEntity(entity: Profile): ProfileResource {
    return {
      id: entity.id!,
      userId: entity.userId,
      username: entity.username,
      avatar: entity.avatar,
      bio: entity.bio,
      role: entity.role,
      skills: entity.skills,
      experiences: entity.experiences.map(exp => this.experienceToResource(exp)),
      isComplete: entity.isComplete,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
    } as ProfileResource;
  }

  /**
   * Convert ExperienceResource to Experience entity
   */
  private experienceFromResource(resource: ExperienceResource): Experience {
    return new Experience({
      id: resource.id,
      title: resource.title,
      company: resource.company,
      period: resource.period,
      description: resource.description,
      current: resource.current,
      startDate: resource.startDate ? new Date(resource.startDate) : null,
      endDate: resource.endDate ? new Date(resource.endDate) : null,
      createdAt: resource.createdAt,
      updatedAt: resource.updatedAt,
    });
  }

  /**
   * Convert Experience entity to ExperienceResource
   */
  private experienceToResource(experience: Experience): ExperienceResource {
    return {
      id: experience.id,
      title: experience.title,
      company: experience.company,
      period: experience.period,
      description: experience.description,
      current: experience.current,
      startDate: experience.startDate ? experience.startDate.toISOString() : null,
      endDate: experience.endDate ? experience.endDate.toISOString() : null,
      createdAt: experience.createdAt.toISOString(),
      updatedAt: experience.updatedAt.toISOString(),
    } as ExperienceResource;
  }
}
