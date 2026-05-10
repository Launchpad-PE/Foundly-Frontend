import { BaseResource, BaseResponse } from '../../shared/infrastructure/base-response';
import { ExperienceResource } from './experience-response';

export interface ProfileResource extends BaseResource {
  id: string;
  userId: string;
  username: string;
  avatar: string | null;
  bio: string;
  role: string;
  skills: string[];
  experiences: ExperienceResource[];
  isComplete: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileResponse extends BaseResponse {
  profile: ProfileResource;
}

export interface ProfilesResponse extends BaseResponse {
  profiles: ProfileResource[];
}
