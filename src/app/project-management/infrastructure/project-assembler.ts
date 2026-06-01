// project-assembler.ts (versión corregida)
import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { Project } from '../domain/entities/project.entity';
import { ProjectResource, ProjectResponse, ProjectsResponse, RoleResource } from './project-response';
import { CardItem, CardTitle, Role, RoleCardInfo, RoleName } from '../domain/value-objects/role.vo';


export class ProjectAssembler implements BaseAssembler<Project, ProjectResource, ProjectResponse | ProjectsResponse> {

  /**
   * Convert response to entity (for single project)
   */
  toEntityFromResponse(response: ProjectResponse): Project {
    return this.toEntityFromResource(response.project);
  }

  /**
   * Convert response to entities (for multiple projects)
   */
  toEntitiesFromResponse(response: ProjectsResponse): Project[] {
    return response.projects.map(resource => this.toEntityFromResource(resource));
  }

  /**
   * Convert resource to entity usando el método estático create
   */
  toEntityFromResource(resource: ProjectResource): Project {
    // Convertir roles al formato que espera el método create
    const roles = (resource.roles || []).map(role => ({
      name: role.name,
      cardInfo: {
        title: role.cardInfo.title,
        items: role.cardInfo.items
      }
    }));

    // Usar el método estático create en lugar del constructor privado
    return Project.create({
      id: resource.id,
      name: resource.name,
      area: resource.area,
      tags: resource.tags,
      summary: resource.summary,
      environmentalImpact: resource.environmentalImpact || undefined,
      academicLevel: resource.academicLevel || undefined,
      benefits: resource.benefits,
      requiredSkills: resource.requiredSkills,
      duration: {
        amount: resource.duration.amount,
        type: resource.duration.type
      },
      roles: roles,
      authorId: resource.authorId,
      authorName: resource.authorName || null,
      status: resource.status,
      createdAt: resource.createdAt,
      updatedAt: resource.updatedAt,
    });
  }

  /**
   * Convert entity to resource (for create/update)
   */
  toResourceFromEntity(entity: Project): ProjectResource {
    return {
      id: entity.id.toString(),
      name: entity.name.getValue(),
      area: entity.area.getValue(),
      tags: entity.tags.map(tag => tag.getValue()),
      summary: entity.summary.getValue(),
      environmentalImpact: entity.environmentalImpact ? entity.environmentalImpact.getMetrics() : null,
      academicLevel: entity.academicLevel ? entity.academicLevel.getValue() : null,
      benefits: entity.benefits.map(benefit => benefit.getDescription()),
      requiredSkills: entity.requiredSkills.map(skill => skill.getValue()),
      duration: {
        amount: entity.duration.getAmount(),
        type: entity.duration.getType()
      },
      roles: entity.roles.map(role => this.roleToResource(role)),
      status: entity.status,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
      authorId: entity.authorId.toString()
    };
  }

  /**
   * Convert RoleResource to Role entity
   */
  private roleFromResource(resource: RoleResource): Role {
    return new Role(
      new RoleName(resource.name),
      new RoleCardInfo(
        new CardTitle(resource.cardInfo.title),
        resource.cardInfo.items.map(item => new CardItem(item))
      )
    );
  }

  /**
   * Convert Role entity to RoleResource
   */
  private roleToResource(role: Role): RoleResource {
    return {
      id: crypto.randomUUID(),
      name: role.name.getValue(),
      cardInfo: {
        title: role.cardInfo.title.getValue(),
        items: role.cardInfo.items.map(item => item.getDescription())
      }
    };
  }
}
