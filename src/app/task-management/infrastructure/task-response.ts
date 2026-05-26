import { BaseResource, BaseResponse } from '../../shared/infrastructure/base-response';
import { TaskStatus } from '../domain/enum/task-status.enum';

export interface ChecklistStepResource {
  description: string;
  done: boolean;
}

export interface TaskResource extends BaseResource {
  id: string;
  projectId: string;
  assigneeId: string;
  creatorId: string;
  title: string;
  description: string;
  dueDate: string;
  checklist: ChecklistStepResource[];
  attachments: string[];
  tools: string[];
  comment: string | null;
  status: TaskStatus;
  deliveryUrl: string | null;
  deliveryNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TaskResponse extends BaseResponse {
  task: TaskResource;
}

export interface TasksResponse extends BaseResponse {
  tasks: TaskResource[];
}
