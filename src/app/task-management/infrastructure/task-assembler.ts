import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { Task } from '../domain/entities/task.entity';
import { TaskStatus } from '../domain/enum/task-status.enum';
import { TaskResource, TaskResponse, TasksResponse } from './task-response';

/**
 * The real Spring backend's TaskStatus enum only has PENDING/COMPLETED, in
 * uppercase (com.foundly.foundlyplatform.tasks.domain.model.valueobjects.TaskStatus).
 * The frontend's TaskStatus enum uses lowercase values ('pending'/'completed')
 * plus a client-only 'delayed' state that's never sent to the backend.
 * These two helpers keep the wire format and the in-app enum in sync so
 * status round-trips correctly instead of silently reverting to PENDING or
 * getting rejected with a 400 by Jackson's case-sensitive enum parsing.
 */
function mapStatusFromBackend(raw: string): TaskStatus {
  return String(raw).toUpperCase() === 'COMPLETED' ? TaskStatus.COMPLETED : TaskStatus.PENDING;
}

function mapStatusToBackend(status: TaskStatus): 'PENDING' | 'COMPLETED' {
  return status === TaskStatus.COMPLETED ? 'COMPLETED' : 'PENDING';
}

export class TaskAssembler implements BaseAssembler<Task, TaskResource, TaskResponse | TasksResponse> {

  toEntityFromResponse(response: TaskResponse): Task {
    return this.toEntityFromResource(response.task);
  }

  toEntitiesFromResponse(response: TasksResponse): Task[] {
    return (response.tasks ?? []).map(r => this.toEntityFromResource(r));
  }

  toEntityFromResource(resource: TaskResource): Task {
    return Task.create({
      // Spring serializes the numeric Long id as a JSON number, not a string;
      // TaskId.fromString() calls .trim() on it, which throws on a raw number.
      id: resource.id != null ? String(resource.id) : undefined,
      projectId: resource.projectId,
      assigneeId: resource.assigneeId,
      creatorId: resource.creatorId,
      title: resource.title,
      description: resource.description,
      dueDate: resource.dueDate,
      checklist: resource.checklist ?? [],
      attachments: resource.attachments ?? [],
      tools: resource.tools ?? [],
      comment: resource.comment,
      status: mapStatusFromBackend(resource.status as unknown as string),
      deliveryUrl: resource.deliveryUrl,
      deliveryNotes: resource.deliveryNotes,
      createdAt: new Date(resource.createdAt),
      updatedAt: new Date(resource.updatedAt)
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
      status: mapStatusToBackend(entity.status) as unknown as TaskStatus,
      deliveryUrl: entity.deliveryUrl ? entity.deliveryUrl.getValue() : null,
      deliveryNotes: entity.deliveryNotes,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString()
    };
  }
}
