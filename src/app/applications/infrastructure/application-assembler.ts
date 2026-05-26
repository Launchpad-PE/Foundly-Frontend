// application-assembler.ts
import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { Application } from '../domain/entities/application.entity';
import {
  ApplicationResource,
  ApplicationResponse,
  ApplicationsResponse
} from './application-response';

export class ApplicationAssembler implements BaseAssembler<Application, ApplicationResource, ApplicationResponse | ApplicationsResponse> {

  toEntityFromResponse(response: ApplicationResponse): Application {
    return this.toEntityFromResource(response.application);
  }

  toEntitiesFromResponse(response: ApplicationsResponse): Application[] {
    return (response.applications ?? []).map(resource => this.toEntityFromResource(resource));
  }

  toEntityFromResource(resource: ApplicationResource): Application {
    return Application.create({
      id: resource.id,
      projectId: resource.projectId,
      userId: resource.userId,
      roleId: resource.roleId,
      fullName: resource.fullName,
      email: resource.email,
      portfolioUrl: resource.portfolioUrl,
      phone: resource.phone,
      cvUrl: resource.cvUrl,
      message: resource.message,
      acceptedTerms: resource.acceptedTerms,
      status: resource.status,
      createdAt: resource.createdAt,
      updatedAt: resource.updatedAt
    });
  }

  toResourceFromEntity(entity: Application): ApplicationResource {
    return {
      // `entity.id` ya es un string primitivo, no un value object,
      // así que no se le aplica `.toString()` (sería engañoso y redundante).
      id: entity.id,
      projectId: entity.projectId.toString(),
      userId: entity.userId.toString(),
      roleId: entity.roleId,
      fullName: entity.fullName.getValue(),
      email: entity.email.getValue(),
      portfolioUrl: entity.portfolioUrl ? entity.portfolioUrl.getValue() : null,
      phone: entity.phone ? entity.phone.getValue() : null,
      cvUrl: entity.cvUrl.getValue(),
      message: entity.message.getValue(),
      acceptedTerms: entity.acceptedTerms,
      status: entity.status,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString()
    };
  }
}
