import { TaskId } from '../value-objects/task-id.vo';
import { TaskTitle } from '../value-objects/task-title.vo';
import { TaskDescription } from '../value-objects/task-description.vo';
import { ChecklistStep } from '../value-objects/checklist-step.vo';
import { Tool } from '../value-objects/tool.vo';
import { UrlLink } from '../value-objects/url-link.vo';
import { ProjectId } from '../value-objects/project-id.vo';
import { UserId } from '../value-objects/user-id.vo';
import { TaskStatus } from '../enum/task-status.enum';

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

  private static normalizeDate(dateInput: string | Date): Date {
    if (dateInput instanceof Date) {
      return new Date(Date.UTC(
        dateInput.getUTCFullYear(),
        dateInput.getUTCMonth(),
        dateInput.getUTCDate(),
        12, 0, 0
      ));
    }

    const dateStr = dateInput;

    if (dateStr.includes('T') && dateStr.includes('Z')) {
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) return d;
    }

    if (dateStr.length === 10 && dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = dateStr.split('-').map(Number);
      return new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
    }

    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) return d;

    throw new Error('Invalid date');
  }

  // CORREGIDO: Obtiene la fecha UTC actual correctamente
  private static getCurrentUTC(): Date {
    const now = new Date();
    // Creamos un timestamp UTC explícito
    const utcTimestamp = Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      now.getUTCHours(),
      now.getUTCMinutes(),
      now.getUTCSeconds(),
      now.getUTCMilliseconds()
    );
    return new Date(utcTimestamp);
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
    createdAt?: Date;
    updatedAt?: Date;
  }): Task {
    const id = props.id ? TaskId.fromString(props.id) : TaskId.generate();
    const due = this.normalizeDate(props.dueDate);
    const now = new Date();

    const createdAt = props.createdAt
      ? new Date(props.createdAt)
      : this.getCurrentUTC();
    const updatedAt = props.updatedAt
      ? new Date(props.updatedAt)
      : this.getCurrentUTC();

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
      props.createdAt ?? now,
      props.updatedAt ?? now
    );
  }

  getDisplayStatus(now: Date = new Date()): TaskStatus {
    if (this.status === TaskStatus.COMPLETED) return TaskStatus.COMPLETED;
    const nowUTC = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
    const dueUTC = Date.UTC(this.dueDate.getUTCFullYear(), this.dueDate.getUTCMonth(), this.dueDate.getUTCDate());
    return nowUTC > dueUTC ? TaskStatus.DELAYED : TaskStatus.PENDING;
  }

  isCompleted(): boolean {
    return this.status === TaskStatus.COMPLETED;
  }

  isDelayed(now: Date = new Date()): boolean {
    return this.getDisplayStatus(now) === TaskStatus.DELAYED;
  }

  reschedule(newDueDate: Date): void {
    if (this.isCompleted()) {
      throw new Error('Cannot reschedule a completed task');
    }

    const utcDate = new Date(Date.UTC(
      newDueDate.getUTCFullYear(),
      newDueDate.getUTCMonth(),
      newDueDate.getUTCDate(),
      12, 0, 0
    ));

    if (isNaN(utcDate.getTime())) {
      throw new Error('Invalid new due date');
    }
    this.dueDate = utcDate;
    this.updatedAt = Task.getCurrentUTC();
  }

  complete(deliveryUrl: string, deliveryNotes?: string | null): void {
    if (this.isCompleted()) {
      throw new Error('Task is already completed');
    }
    this.deliveryUrl = new UrlLink(deliveryUrl);
    this.deliveryNotes = deliveryNotes && deliveryNotes.trim().length > 0 ? deliveryNotes : null;
    this.status = TaskStatus.COMPLETED;
    this.updatedAt = Task.getCurrentUTC();
  }
}
