import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-endpoint';
import { environment } from '../../../environments/environment';
import { Task } from '../domain/entities/task.entity';
import { TaskAssembler } from './task-assembler';
import { TaskResource, TaskResponse, TasksResponse } from './task-response';

export class TaskApiEndpoint extends BaseApiEndpoint<
  Task,
  TaskResource,
  TaskResponse | TasksResponse,
  TaskAssembler
> {
  private readonly tasksUrl: string;

  constructor(http: HttpClient) {
    super(
      http,
      `${environment.platformProviderApiBaseUrl}${environment.platformTaskEndpointPath}`,
      new TaskAssembler()
    );
    this.tasksUrl = `${environment.platformProviderApiBaseUrl}${environment.platformTaskEndpointPath}`;
  }

  getTaskById(id: string): Observable<TaskResponse> {
    return this.http.get<TaskResource>(`${this.tasksUrl}/${id}`).pipe(
      map(task => ({ task }) as TaskResponse)
    );
  }

  getByProjectId(projectId: string): Observable<TasksResponse> {
    return this.http.get<TaskResource[]>(`${this.tasksUrl}?projectId=${projectId}`).pipe(
      map(tasks => ({ tasks }) as TasksResponse)
    );
  }

  getByProjectAndAssignee(projectId: string, assigneeId: string): Observable<TasksResponse> {
    return this.http.get<TaskResource[]>(
      `${this.tasksUrl}?projectId=${projectId}&assigneeId=${assigneeId}`
    ).pipe(map(tasks => ({ tasks }) as TasksResponse));
  }

  getByAssignee(assigneeId: string): Observable<TasksResponse> {
    return this.http.get<TaskResource[]>(`${this.tasksUrl}?assigneeId=${assigneeId}`).pipe(
      map(tasks => ({ tasks }) as TasksResponse)
    );
  }

  createTask(task: Task): Observable<TaskResponse> {
    const resource = this.assembler.toResourceFromEntity(task);
    return this.http.post<TaskResource>(this.tasksUrl, resource).pipe(
      map(created => ({ task: created }) as TaskResponse)
    );
  }

  patchTask(id: string, partial: Partial<TaskResource>): Observable<TaskResponse> {
    return this.http.patch<TaskResource>(`${this.tasksUrl}/${id}`, partial).pipe(
      map(updated => ({ task: updated }) as TaskResponse)
    );
  }

  deleteTask(id: string): Observable<void> {
    return this.http.delete<void>(`${this.tasksUrl}/${id}`);
  }

  completeTask(taskId: string, deliveryUrl: string, deliveryNotes?: string | null): Observable<TaskResponse> {
    const body = { deliveryUrl, deliveryNotes };
    return this.http.post<TaskResource>(`${this.tasksUrl}/${taskId}/complete`, body).pipe(
      map(task => ({ task }) as TaskResponse)
    );
  }
}
