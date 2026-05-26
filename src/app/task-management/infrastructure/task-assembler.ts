import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { Task } from '../domain/entities/task.entity';
import { TaskResource, TaskResponse, TasksResponse } from './task-response';

export class TaskAssembler implements BaseAssembler<Task, TaskResource, TaskResponse | TasksResponse> {

  toEntityFromResponse(response: TaskResponse): Task {
    return this.toEntityFromResource(response.task);
  }

  toEntitiesFromResponse(response: TasksResponse): Task[] {
    return (response.tasks ?? []).map(r => this.toEntityFromResource(r));
  }

  toEntityFromResource(resource: TaskResource): Task {
    return Task.create({
      id: resource.id,
      projectId: resource.projectId,
      assigneeId: resource.assigneeId,
      creatorId: resource.creatorId,
      title: resource.title,
      description: resource.description,
      dueDate: resource.dueDate,
      checklist: resource.checklist,
      attachments: resource.attachments,
      tools: resource.tools,
      comment: resource.comment,
      status: resource.status,
      deliveryUrl: resource.deliveryUrl,
      deliveryNotes: resource.deliveryNotes,
      createdAt: resource.createdAt,
      updatedAt: resource.updatedAt
    });
  }

  toResourceFromEntity(entity: Task): TaskResource {
    return {
      id: entity.id,
      projectId: entity.projectId.toString(),
      assigneeId: entity.assigneeId.toString(),
      creatorId: entity.creatorId.toString(),
      title: entity.title.getValue(),
      description: entity.description.getValue(),
      dueDate: entity.dueDate.toISOString(),
      checklist: entity.checklist.map(s => ({
        description: s.getDescription(),
        done: s.isDone()
      })),
      attachments: entity.attachments.map(a => a.getValue()),
      tools: entity.tools.map(t => t.getName()),
      comment: entity.comment,
      status: entity.status,
      deliveryUrl: entity.deliveryUrl ? entity.deliveryUrl.getValue() : null,
      deliveryNotes: entity.deliveryNotes,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString()
    };
  }
}
