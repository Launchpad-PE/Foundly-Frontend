import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { Milestone } from '../domain/entities/milestone.entity';
import { MilestoneTask } from '../domain/entities/milestone-task.entity';
import {
  MilestoneResource,
  MilestoneResponse,
  MilestonesResponse,
  MilestoneTaskResource,
  CreateTaskRequest
} from './milestone-response';

export class MilestoneAssembler implements BaseAssembler<Milestone, MilestoneResource, MilestoneResponse | MilestonesResponse> {

  // Convert single response to entity
  toEntityFromResponse(response: MilestoneResponse): Milestone {
    return this.toEntityFromResource(response.milestone);
  }

  // Convert multiple response to entities
  toEntitiesFromResponse(response: MilestonesResponse): Milestone[] {
    return (response.milestones ?? []).map(resource => this.toEntityFromResource(resource));
  }

  // Convert resource to entity
  toEntityFromResource(resource: MilestoneResource): Milestone {
    return Milestone.create({
      id: resource.id,
      projectId: resource.projectId,
      creatorId: resource.creatorId,
      title: resource.title,
      description: resource.description,
      dueDate: new Date(resource.dueDate),
      tools: resource.tools,
      generalComment: resource.generalComment || undefined,
      attachments: resource.attachments,
      status: resource.status,
      deliveryUrl: resource.deliveryUrl || null,
      deliveryNotes: resource.deliveryNotes || null,
      createdAt: new Date(resource.createdAt),
      updatedAt: new Date(resource.updatedAt),
      tasks: resource.tasks?.map(task => this.taskResourceToCreateProps(task))
    });
  }

  // Convert entity to resource
  toResourceFromEntity(entity: Milestone): MilestoneResource {
    return {
      id: entity.id,
      projectId: entity.projectId.toString(),
      creatorId: entity.creatorId.toString(),
      title: entity.title.getValue(),
      description: entity.description.getValue(),
      tools: entity.tools.map(tool => tool.getName()),
      generalComment: entity.generalComment,
      dueDate: entity.dueDate.toISOString(),
      attachments: entity.attachments.map(att => att.getValue()),
      tasks: entity.tasks.map(task => this.taskToResource(task)),
      status: entity.status,
      deliveryUrl: null,
      deliveryNotes: null,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString()
    };
  }

  // Convert MilestoneTask to Resource
  taskToResource(task: MilestoneTask): MilestoneTaskResource {
    return {
      id: task.id,
      milestoneId: task.milestoneId,
      title: task.title,
      description: task.description.getValue(),
      assigneeId: task.assigneeId.toString(),
      dueDate: task.dueDate.toISOString(),
      checklist: task.checklist.map(step => ({
        description: step.getDescription(),
        done: step.isDone()
      })),
      attachments: task.attachments.map(att => att.getValue()),
      status: task.status,
      deliveryUrl: task.deliveryUrl,
      deliveryNotes:  task.deliveryNotes,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString()
    };
  }

  // Convert Task Resource to Create Props
  taskResourceToCreateProps(resource: MilestoneTaskResource) {
    return {
      id: resource.id,
      milestoneId: resource.milestoneId,
      title: resource.title,
      description: resource.description,
      assigneeId: resource.assigneeId,
      dueDate: resource.dueDate ? new Date(resource.dueDate) : undefined,
      checklist: resource.checklist,
      attachments: resource.attachments,
      status: resource.status,
      deliveryUrl: resource.deliveryUrl ?? null,
      deliveryNotes: resource.deliveryNotes ?? null,       createdAt: new Date(resource.createdAt),
      updatedAt: new Date(resource.updatedAt)
    };
  }
  // Convert Task to Create Request (para enviar a la API)
  taskToCreateRequest(task: MilestoneTask): CreateTaskRequest {
    return {
      title: task.title,
      description: task.description.getValue(),
      assigneeId: task.assigneeId.toString(),
      checklist: task.checklist.map(step => ({
        description: step.getDescription(),
        done: step.isDone()
      })),
      attachments: task.attachments.map(att => att.getValue())
    };
  }
}
