import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { BaseApi } from '../../shared/infrastructure/base-api';
import { Milestone } from '../domain/entities/milestone.entity';
import { MilestoneTask } from '../domain/entities/milestone-task.entity';
import { MilestoneApiEndpoint } from './milestone-api-endpoint';
import { MilestoneAssembler } from './milestone-assembler';
import { CreateTaskRequest } from './milestone-response';

@Injectable({ providedIn: 'root' })
export class MilestoneApi extends BaseApi {
  private readonly milestoneEndpoint: MilestoneApiEndpoint;
  private readonly assembler = new MilestoneAssembler();

  constructor(httpClient: HttpClient) {
    super();
    this.milestoneEndpoint = new MilestoneApiEndpoint(httpClient);
  }

  // ============= Milestone CRUD =============

  getMilestone(id: string): Observable<Milestone> {
    return this.milestoneEndpoint.getMilestoneById(id).pipe(
      map(response => this.assembler.toEntityFromResponse(response))
    );
  }

  getMilestonesByProject(projectId: string): Observable<Milestone[]> {
    return this.milestoneEndpoint.getByProjectId(projectId).pipe(
      map(response => this.assembler.toEntitiesFromResponse(response))
    );
  }

  createMilestone(milestone: Milestone): Observable<Milestone> {
    return this.milestoneEndpoint.createMilestone(milestone).pipe(
      map(response => this.assembler.toEntityFromResponse(response))
    );
  }

  updateMilestone(milestone: Milestone): Observable<Milestone> {
    return this.milestoneEndpoint.updateMilestone(milestone.id, milestone).pipe(
      map(response => this.assembler.toEntityFromResponse(response))
    );
  }

  patchMilestone(id: string, partialData: any): Observable<Milestone> {
    return this.milestoneEndpoint.patchMilestone(id, partialData).pipe(
      map(response => this.assembler.toEntityFromResponse(response))
    );
  }

  deleteMilestone(id: string): Observable<void> {
    return this.milestoneEndpoint.deleteMilestone(id);
  }

  // ============= Task Management =============

  addTaskToMilestone(milestoneId: string, task: MilestoneTask): Observable<MilestoneTask> {
    const taskRequest: CreateTaskRequest = this.assembler.taskToCreateRequest(task);
    return this.milestoneEndpoint.addTask(milestoneId, taskRequest).pipe(
      map(response => {
        const taskResource = response.task;
        return MilestoneTask.create({
          id: taskResource.id,
          milestoneId: taskResource.milestoneId,
          title: taskResource.title,
          description: taskResource.description,
          assigneeId: taskResource.assigneeId,
          checklist: taskResource.checklist,
          attachments: taskResource.attachments,
          status: taskResource.status,
          createdAt: new Date(taskResource.createdAt),
          updatedAt: new Date(taskResource.updatedAt)
        });
      })
    );
  }

  updateTaskStatus(taskId: string, status: string): Observable<MilestoneTask> {
    return this.milestoneEndpoint.updateTaskStatus(taskId, { status: status as any }).pipe(
      map(response => {
        const taskResource = response.task;
        return MilestoneTask.create({
          id: taskResource.id,
          milestoneId: taskResource.milestoneId,
          title: taskResource.title,
          description: taskResource.description,
          assigneeId: taskResource.assigneeId,
          checklist: taskResource.checklist,
          attachments: taskResource.attachments,
          status: taskResource.status,
          createdAt: new Date(taskResource.createdAt),
          updatedAt: new Date(taskResource.updatedAt)
        });
      })
    );
  }

  updateTask(taskId: string, task: MilestoneTask): Observable<MilestoneTask> {
    const taskRequest: CreateTaskRequest = this.assembler.taskToCreateRequest(task);
    return this.milestoneEndpoint.updateTask(taskId, taskRequest).pipe(
      map(response => {
        const taskResource = response.task;
        return MilestoneTask.create({
          id: taskResource.id,
          milestoneId: taskResource.milestoneId,
          title: taskResource.title,
          description: taskResource.description,
          assigneeId: taskResource.assigneeId,
          checklist: taskResource.checklist,
          attachments: taskResource.attachments,
          status: taskResource.status,
          createdAt: new Date(taskResource.createdAt),
          updatedAt: new Date(taskResource.updatedAt)
        });
      })
    );
  }

  deleteTask(taskId: string): Observable<void> {
    return this.milestoneEndpoint.deleteTask(taskId);
  }
}
