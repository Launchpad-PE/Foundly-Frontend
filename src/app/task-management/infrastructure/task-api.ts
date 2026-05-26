import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import { BaseApi } from '../../shared/infrastructure/base-api';
import { Task } from '../domain/entities/task.entity';
import { TaskApiEndpoint } from './task-api-endpoint';
import { TaskAssembler } from './task-assembler';

@Injectable({ providedIn: 'root' })
export class TaskApi extends BaseApi {
  private readonly taskEndpoint: TaskApiEndpoint;
  private readonly assembler = new TaskAssembler();

  constructor(httpClient: HttpClient) {
    super();
    this.taskEndpoint = new TaskApiEndpoint(httpClient);
  }

  getTask(id: string): Observable<Task> {
    return this.taskEndpoint.getTaskById(id).pipe(
      map(r => this.assembler.toEntityFromResponse(r))
    );
  }

  getTasksByProject(projectId: string): Observable<Task[]> {
    return this.taskEndpoint.getByProjectId(projectId).pipe(
      map(r => this.assembler.toEntitiesFromResponse(r))
    );
  }

  getTasksByProjectAndAssignee(projectId: string, assigneeId: string): Observable<Task[]> {
    return this.taskEndpoint.getByProjectAndAssignee(projectId, assigneeId).pipe(
      map(r => this.assembler.toEntitiesFromResponse(r))
    );
  }

  getTasksByAssignee(assigneeId: string): Observable<Task[]> {
    return this.taskEndpoint.getByAssignee(assigneeId).pipe(
      map(r => this.assembler.toEntitiesFromResponse(r))
    );
  }

  createTask(task: Task): Observable<Task> {
    return this.taskEndpoint.createTask(task).pipe(
      map(r => this.assembler.toEntityFromResponse(r))
    );
  }

  updateTask(task: Task): Observable<Task> {
    const resource = this.assembler.toResourceFromEntity(task);
    return this.taskEndpoint.patchTask(task.id, resource).pipe(
      map(r => this.assembler.toEntityFromResponse(r))
    );
  }

  deleteTask(id: string): Observable<void> {
    return this.taskEndpoint.deleteTask(id);
  }
}
