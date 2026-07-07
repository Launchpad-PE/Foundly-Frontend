import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-endpoint';
import { environment } from '../../../environments/environment';
import { Milestone } from '../domain/entities/milestone.entity';
import { MilestoneAssembler } from './milestone-assembler';
import { MilestoneTaskStatus } from '../domain/enum/milestone-task-status.enum';
import {
  MilestoneResource,
  MilestoneResponse,
  MilestonesResponse,
  MilestoneTaskResponse,
  UpdateTaskStatusRequest,
  CreateTaskRequest
} from './milestone-response';

export class MilestoneApiEndpoint extends BaseApiEndpoint<
  Milestone,
  MilestoneResource,
  MilestoneResponse | MilestonesResponse,
  MilestoneAssembler
> {
  private readonly milestonesUrl: string;
  private readonly milestoneTasksUrl: string;

  constructor(http: HttpClient) {
    super(
      http,
      `${environment.platformProviderApiBaseUrl}${environment.platformMilestoneEndpointPath}`,
      new MilestoneAssembler(),
    );
    this.milestonesUrl = `${environment.platformProviderApiBaseUrl}${environment.platformMilestoneEndpointPath}`;
    this.milestoneTasksUrl = `${environment.platformProviderApiBaseUrl}${environment.platformMilestoneTaskEndpointPath}`;
  }

  // Get milestone by ID
  getMilestoneById(id: string): Observable<MilestoneResponse> {
    return this.http
      .get<MilestoneResource>(`${this.milestonesUrl}/${id}`)
      .pipe(map((milestone) => ({ milestone }) as MilestoneResponse));
  }

  // Get milestones by project ID
  getByProjectId(projectId: string): Observable<MilestonesResponse> {
    return this.http
      .get<MilestoneResource[]>(`${this.milestonesUrl}?projectId=${projectId}`)
      .pipe(map((milestones) => ({ milestones }) as MilestonesResponse));
  }

  // Create milestone
  createMilestone(milestone: Milestone): Observable<MilestoneResponse> {
    const resource = this.assembler.toResourceFromEntity(milestone);
    return this.http
      .post<MilestoneResource>(this.milestonesUrl, resource)
      .pipe(map((created) => ({ milestone: created }) as MilestoneResponse));
  }

  // Update milestone (full update)
  updateMilestone(id: string, milestone: Milestone): Observable<MilestoneResponse> {
    const resource = this.assembler.toResourceFromEntity(milestone);
    return this.http
      .put<MilestoneResource>(`${this.milestonesUrl}/${id}`, resource)
      .pipe(map((updated) => ({ milestone: updated }) as MilestoneResponse));
  }

  // Patch milestone (partial update)
  patchMilestone(
    id: string,
    partialData: Partial<MilestoneResource>,
  ): Observable<MilestoneResponse> {
    return this.http
      .patch<MilestoneResource>(`${this.milestonesUrl}/${id}`, partialData)
      .pipe(map((updated) => ({ milestone: updated }) as MilestoneResponse));
  }

  // Delete milestone
  deleteMilestone(id: string): Observable<void> {
    return this.http.delete<void>(`${this.milestonesUrl}/${id}`);
  }

  // Add task to milestone
  addTask(milestoneId: string, taskRequest: CreateTaskRequest): Observable<MilestoneTaskResponse> {
    return this.http
      .post<any>(`${this.milestonesUrl}/${milestoneId}/tasks`, taskRequest)
      .pipe(map((created) => ({ task: created }) as MilestoneTaskResponse));
  }

  // Update task status

  // Update task status
  updateTaskStatus(
    taskId: string,
    status: UpdateTaskStatusRequest,
  ): Observable<MilestoneTaskResponse> {
    return this.http
      .patch<any>(`${this.milestoneTasksUrl}/${taskId}/status`, status)
      .pipe(map((task) => ({ task }) as MilestoneTaskResponse));
  }

  // Update task (full update)
  updateTask(taskId: string, taskRequest: CreateTaskRequest): Observable<MilestoneTaskResponse> {
    return this.http
      .put<any>(`${this.milestoneTasksUrl}/${taskId}`, taskRequest)
      .pipe(map((updated) => ({ task: updated }) as MilestoneTaskResponse));
  }

  // Delete task
  deleteTask(taskId: string): Observable<void> {
    return this.http.delete<void>(`${this.milestoneTasksUrl}/${taskId}`);
  }

  // Completar una tarea (entregar)
  completeTask(
    taskId: string,
    deliveryUrl: string,
    deliveryNotes: string | null,
  ): Observable<MilestoneTaskResponse> {
    return this.http
      .post<any>(`${this.milestoneTasksUrl}/${taskId}/complete`, { deliveryUrl, deliveryNotes })
      .pipe(map((task) => ({ task }) as MilestoneTaskResponse));
  }
}
