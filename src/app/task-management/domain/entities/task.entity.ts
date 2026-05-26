import { TaskId } from '../value-objects/task-id.vo';
import { TaskTitle } from '../value-objects/task-title.vo';
import { TaskDescription } from '../value-objects/task-description.vo';
import { ChecklistStep } from '../value-objects/checklist-step.vo';
import { Tool } from '../value-objects/tool.vo';
import { UrlLink } from '../value-objects/url-link.vo';
import { ProjectId } from '../value-objects/project-id.vo';
import { UserId } from '../value-objects/user-id.vo';
import { TaskStatus } from '../enum/task-status.enum';

/**
 * Tarea asignada por el emprendedor a un colaborador dentro de un proyecto.
 *
 * Reglas:
 * - Una tarea siempre pertenece a un proyecto y a un assignee (colaborador).
 * - No se aceptan archivos; los adjuntos son enlaces externos.
 * - El status real expuesto al usuario es derivado: si está pendiente y ya pasó
 *   la fecha de entrega, se reporta como DELAYED.
 * - Solo se puede completar una tarea desde PENDING o DELAYED.
 */
export class Task {
  public readonly id: string;
  public readonly projectId: ProjectId;
  public readonly assigneeId: UserId;
  public readonly creatorId: UserId;
  public readonly title: TaskTitle;
  public readonly description: TaskDescription;
  public dueDate: Date;
  public checklist: ChecklistStep[];
  public readonly attachments: UrlLink[];
  public readonly tools: Tool[];
  public readonly comment: string | null;
  /** Estado persistido (solo PENDING / COMPLETED). DELAYED se deriva. */
  public status: TaskStatus.PENDING | TaskStatus.COMPLETED;
  public deliveryUrl: UrlLink | null;
  public deliveryNotes: string | null;
  public readonly createdAt: Date;
  public updatedAt: Date;

  private constructor(
    taskId: TaskId,
    projectId: ProjectId,
    assigneeId: UserId,
    creatorId: UserId,
    title: TaskTitle,
    description: TaskDescription,
    dueDate: Date,
    checklist: ChecklistStep[],
    attachments: UrlLink[],
    tools: Tool[],
    comment: string | null,
    status: TaskStatus.PENDING | TaskStatus.COMPLETED,
    deliveryUrl: UrlLink | null,
    deliveryNotes: string | null,
    createdAt: Date,
    updatedAt: Date
  ) {
    this.id = taskId.toString();
    this.projectId = projectId;
    this.assigneeId = assigneeId;
    this.creatorId = creatorId;
    this.title = title;
    this.description = description;
    this.dueDate = dueDate;
    this.checklist = checklist;
    this.attachments = attachments;
    this.tools = tools;
    this.comment = comment;
    this.status = status;
    this.deliveryUrl = deliveryUrl;
    this.deliveryNotes = deliveryNotes;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static create(props: {
    id?: string;
    projectId: string;
    assigneeId: string;
    creatorId: string;
    title: string;
    description: string;
    dueDate: string | Date;
    checklist?: Array<{ description: string; done?: boolean }>;
    attachments?: string[];
    tools?: string[];
    comment?: string | null;
    status?: TaskStatus;
    deliveryUrl?: string | null;
    deliveryNotes?: string | null;
    createdAt?: string;
    updatedAt?: string;
  }): Task {
    const id = props.id ? TaskId.fromString(props.id) : TaskId.generate();
    const due = props.dueDate instanceof Date ? props.dueDate : new Date(props.dueDate);
    if (isNaN(due.getTime())) {
      throw new Error('Invalid dueDate');
    }

    // Solo PENDING o COMPLETED se persisten — DELAYED es derivado en getDisplayStatus()
    const incomingStatus = props.status ?? TaskStatus.PENDING;
    const persistedStatus: TaskStatus.PENDING | TaskStatus.COMPLETED =
      incomingStatus === TaskStatus.COMPLETED ? TaskStatus.COMPLETED : TaskStatus.PENDING;

    return new Task(
      id,
      ProjectId.fromString(props.projectId),
      new UserId(props.assigneeId),
      new UserId(props.creatorId),
      new TaskTitle(props.title),
      new TaskDescription(props.description),
      due,
      (props.checklist ?? []).map(s => new ChecklistStep(s.description, s.done ?? false)),
      (props.attachments ?? []).map(a => new UrlLink(a)),
      (props.tools ?? []).map(t => new Tool(t)),
      props.comment && props.comment.trim().length > 0 ? props.comment : null,
      persistedStatus,
      props.deliveryUrl ? new UrlLink(props.deliveryUrl) : null,
      props.deliveryNotes && props.deliveryNotes.trim().length > 0 ? props.deliveryNotes : null,
      props.createdAt ? new Date(props.createdAt) : new Date(),
      props.updatedAt ? new Date(props.updatedAt) : new Date()
    );
  }

  /** Estado real para mostrar (incluye DELAYED si está vencida). */
  getDisplayStatus(now: Date = new Date()): TaskStatus {
    if (this.status === TaskStatus.COMPLETED) return TaskStatus.COMPLETED;
    return now.getTime() > this.dueDate.getTime() ? TaskStatus.DELAYED : TaskStatus.PENDING;
  }

  isCompleted(): boolean {
    return this.status === TaskStatus.COMPLETED;
  }

  isDelayed(now: Date = new Date()): boolean {
    return this.getDisplayStatus(now) === TaskStatus.DELAYED;
  }

  /** El emprendedor reprograma una tarea retrasada o por vencer. */
  reschedule(newDueDate: Date): void {
    if (this.isCompleted()) {
      throw new Error('Cannot reschedule a completed task');
    }
    if (isNaN(newDueDate.getTime())) {
      throw new Error('Invalid new due date');
    }
    this.dueDate = newDueDate;
    this.updatedAt = new Date();
  }

  /** El colaborador completa la tarea entregando un enlace y notas opcionales. */
  complete(deliveryUrl: string, deliveryNotes?: string | null): void {
    if (this.isCompleted()) {
      throw new Error('Task is already completed');
    }
    this.deliveryUrl = new UrlLink(deliveryUrl);
    this.deliveryNotes = deliveryNotes && deliveryNotes.trim().length > 0 ? deliveryNotes : null;
    this.status = TaskStatus.COMPLETED;
    this.updatedAt = new Date();
  }
}
