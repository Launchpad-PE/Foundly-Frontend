import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
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
      new MilestoneAssembler()
    );
    this.milestonesUrl = `${environment.platformProviderApiBaseUrl}${environment.platformMilestoneEndpointPath}`;
    this.milestoneTasksUrl = `${environment.platformProviderApiBaseUrl}/milestone-tasks`;
  }

  // Get milestone by ID
  getMilestoneById(id: string): Observable<MilestoneResponse> {
    return this.http.get<MilestoneResource>(`${this.milestonesUrl}/${id}`).pipe(
      map(milestone => ({ milestone }) as MilestoneResponse)
    );
  }

  // Get milestones by project ID
  getByProjectId(projectId: string): Observable<MilestonesResponse> {
    return this.http.get<MilestoneResource[]>(`${this.milestonesUrl}?projectId=${projectId}`).pipe(
      map(milestones => ({ milestones }) as MilestonesResponse)
    );
  }

  // Create milestone
  createMilestone(milestone: Milestone): Observable<MilestoneResponse> {
    const resource = this.assembler.toResourceFromEntity(milestone);
    return this.http.post<MilestoneResource>(this.milestonesUrl, resource).pipe(
      map(created => ({ milestone: created }) as MilestoneResponse)
    );
  }

  // Update milestone (full update)
  updateMilestone(id: string, milestone: Milestone): Observable<MilestoneResponse> {
    const resource = this.assembler.toResourceFromEntity(milestone);
    return this.http.put<MilestoneResource>(`${this.milestonesUrl}/${id}`, resource).pipe(
      map(updated => ({ milestone: updated }) as MilestoneResponse)
    );
  }

  // Patch milestone (partial update)
  patchMilestone(id: string, partialData: Partial<MilestoneResource>): Observable<MilestoneResponse> {
    return this.http.patch<MilestoneResource>(`${this.milestonesUrl}/${id}`, partialData).pipe(
      map(updated => ({ milestone: updated }) as MilestoneResponse)
    );
  }

  // Delete milestone
  deleteMilestone(id: string): Observable<void> {
    return this.http.delete<void>(`${this.milestonesUrl}/${id}`);
  }

  // Add task to milestone
  addTask(milestoneId: string, taskRequest: CreateTaskRequest): Observable<MilestoneTaskResponse> {
    const newTask = {
      id: crypto.randomUUID(),
      milestoneId: milestoneId,
      ...taskRequest,
      status: MilestoneTaskStatus.PENDING,
      deliveryUrl: null,
      deliveryNotes: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return this.http.post<any>(this.milestoneTasksUrl, newTask).pipe(
      map(created => ({ task: created }) as MilestoneTaskResponse)
    );
  }

  // Update task status

  updateTaskStatus(taskId: string, status: UpdateTaskStatusRequest): Observable<MilestoneTaskResponse> {
    console.log('updateTaskStatus called with taskId:', taskId, 'status:', status);

    return this.http.get<MilestoneResource[]>(this.milestonesUrl).pipe(
      switchMap(milestones => {
        for (const milestone of milestones) {
          const taskIndex = milestone.tasks?.findIndex(t => t.id === taskId);
          if (taskIndex !== undefined && taskIndex !== -1) {
            console.log('Found task in milestone:', milestone.id);
            const updatedTasks = [...milestone.tasks];
            updatedTasks[taskIndex] = { ...updatedTasks[taskIndex], ...status };
            const updatedMilestone = { ...milestone, tasks: updatedTasks };

            // Hacer PATCH al milestone completo
            return this.http.patch<MilestoneResource>(`${this.milestonesUrl}/${milestone.id}`, updatedMilestone).pipe(
              map(() => {
                console.log('PATCH successful');
                return { task: updatedTasks[taskIndex] } as MilestoneTaskResponse;
              })
            );
          }
        }
        throw new Error('Task not found');
      })
    );
  }

  // Update task (full update)
  updateTask(taskId: string, taskRequest: CreateTaskRequest): Observable<MilestoneTaskResponse> {
    return this.http.put<any>(`${this.milestoneTasksUrl}/${taskId}`, taskRequest).pipe(
      map(updated => ({ task: updated }) as MilestoneTaskResponse)
    );
  }

  // Delete task
  deleteTask(taskId: string): Observable<void> {
    return this.http.delete<void>(`${this.milestoneTasksUrl}/${taskId}`);
  }

  // Completar una tarea (entregar)
  completeTask(taskId: string, deliveryUrl: string, deliveryNotes: string | null): Observable<MilestoneTaskResponse> {
    console.log('=== COMPLETE TASK ===');
    console.log('Task ID:', taskId);
    console.log('Delivery URL:', deliveryUrl);
    console.log('Delivery Notes:', deliveryNotes);

    return this.http.get<MilestoneResource[]>(this.milestonesUrl).pipe(
      switchMap(milestones => {
        for (const milestone of milestones) {
          const taskIndex = milestone.tasks?.findIndex(t => t.id === taskId);
          if (taskIndex !== undefined && taskIndex !== -1) {
            console.log('Found task in milestone:', milestone.id);
            console.log('Current task:', milestone.tasks[taskIndex]);

            const updatedTasks = [...milestone.tasks];
            updatedTasks[taskIndex] = {
              ...updatedTasks[taskIndex],
              status: MilestoneTaskStatus.COMPLETED,
              deliveryUrl: deliveryUrl,           // ✅ Guardar URL
              deliveryNotes: deliveryNotes,       // ✅ Guardar notas
              updatedAt: new Date().toISOString()
            };

            console.log('Updated task:', updatedTasks[taskIndex]);

            const updatedMilestone = { ...milestone, tasks: updatedTasks };

            return this.http.patch<MilestoneResource>(`${this.milestonesUrl}/${milestone.id}`, updatedMilestone).pipe(
              map(() => {
                console.log('Milestone updated successfully');
                return { task: updatedTasks[taskIndex] } as MilestoneTaskResponse;
              })
            );
          }
        }
        throw new Error('Task not found');
      })
    );
  }
}
