import { BaseResource, BaseResponse } from '../../shared/infrastructure/base-response';
import { MilestoneStatus } from '../domain/enum/milestone-status.enum';
import { MilestoneTaskStatus } from '../domain/enum/milestone-task-status.enum';

// Checklist Step Resource
export interface ChecklistStepResource {
  description: string;
  done: boolean;
}

// Milestone Task Resource
export interface MilestoneTaskResource extends BaseResource {
  id: string;
  milestoneId: string;
  title: string;
  description: string;
  assigneeId: string;
  dueDate?: string;
  checklist: ChecklistStepResource[];
  attachments: string[];
  status: MilestoneTaskStatus;
  deliveryUrl: string | null;      // ✅ AGREGAR
  deliveryNotes: string | null;    // ✅ AGREGAR
  createdAt: string;
  updatedAt: string;
}
// Milestone Resource
export interface MilestoneResource extends BaseResource {
  id: string;
  projectId: string;
  creatorId: string;
  title: string;
  description: string;
  tools: string[];
  generalComment: string | null;
  dueDate: string;
  attachments: string[];
  tasks: MilestoneTaskResource[];
  status: MilestoneStatus;
  deliveryUrl: string | null;
  deliveryNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

// Single Milestone Response
export interface MilestoneResponse extends BaseResponse {
  milestone: MilestoneResource;
}

// Multiple Milestones Response
export interface MilestonesResponse extends BaseResponse {
  milestones: MilestoneResource[];
}

// Single Task Response
export interface MilestoneTaskResponse extends BaseResponse {
  task: MilestoneTaskResource;
}

// Update Task Status Request
export interface UpdateTaskStatusRequest {
  status: MilestoneTaskStatus;
}

// Create Task Request
export interface CreateTaskRequest {
  title: string;
  description: string;
  assigneeId: string;
  checklist?: ChecklistStepResource[];
  attachments?: string[];
}
