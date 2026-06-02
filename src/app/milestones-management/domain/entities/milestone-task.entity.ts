import { MilestoneTaskId } from '../value-objects/milestone-task-id.vo';
import { MilestoneId } from '../value-objects/milestone-id.vo';
import { UserId } from '../value-objects/user-id.vo';
import { ChecklistStep } from '../value-objects/checklist-step.vo';
import { Attachments } from '../value-objects/attachments.vo';
import { MilestoneTaskStatus } from '../enum/milestone-task-status.enum';
import { MilestoneTaskDescriptionVo } from '../value-objects/milestone-task-description.vo';

export interface CreateMilestoneTaskProps {
  id?: string;
  milestoneId: string;
  title: string;
  description: string;
  assigneeId: string;
  checklist?: Array<{ description: string; done?: boolean }>;
  attachments?: string[];
  status?: MilestoneTaskStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export class MilestoneTask {
  private _id: MilestoneTaskId;
  private _milestoneId: MilestoneId;

  private constructor(
    taskId: MilestoneTaskId,
    milestoneId: MilestoneId,
    public readonly title: string,
    public readonly description: MilestoneTaskDescriptionVo,
    public readonly assigneeId: UserId,
    private _checklist: ChecklistStep[],
    public readonly attachments: Attachments[],
    private _status: MilestoneTaskStatus,
    public readonly createdAt: Date,
    private _updatedAt: Date
  ) {
    this._id = taskId;
    this._milestoneId = milestoneId;
  }

  // Exponer id como string para cumplir con BaseEntity
  get id(): string {
    return this._id.toString();
  }

  // Exponer milestoneId como string
  get milestoneId(): string {
    return this._milestoneId.toString();
  }

  // Métodos para obtener los value objects cuando sea necesario
  get taskIdValue(): MilestoneTaskId {
    return this._id;
  }

  get milestoneIdValue(): MilestoneId {
    return this._milestoneId;
  }

  static create(props: CreateMilestoneTaskProps): MilestoneTask {
    const id = props.id ? MilestoneTaskId.fromString(props.id) : MilestoneTaskId.generate();
    const now = new Date();

    return new MilestoneTask(
      id,
      MilestoneId.fromString(props.milestoneId),
      props.title.trim(),
      new MilestoneTaskDescriptionVo(props.description),
      new UserId(props.assigneeId),
      (props.checklist ?? []).map(step => new ChecklistStep(step.description, step.done ?? false)),
      (props.attachments ?? []).map(url => new Attachments(url)),
      props.status ?? MilestoneTaskStatus.PENDING,
      props.createdAt ?? now,
      props.updatedAt ?? now
    );
  }

  // Getters
  get checklist(): ChecklistStep[] {
    return [...this._checklist];
  }

  get status(): MilestoneTaskStatus {
    return this._status;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  get isCompleted(): boolean {
    return this._status === MilestoneTaskStatus.COMPLETED;
  }

  get isPending(): boolean {
    return this._status === MilestoneTaskStatus.PENDING;
  }

  get isDelayed(): boolean {
    return this._status === MilestoneTaskStatus.DELAYED;
  }

  // Business methods
  complete(): void {
    if (this.isCompleted) {
      throw new Error('Task is already completed');
    }
    this._status = MilestoneTaskStatus.COMPLETED;
    this._updatedAt = new Date();
  }

  reopen(): void {
    if (!this.isCompleted) {
      throw new Error('Only completed tasks can be reopened');
    }
    this._status = MilestoneTaskStatus.PENDING;
    this._updatedAt = new Date();
  }

  markAsDelayed(): void {
    if (this.isCompleted) {
      throw new Error('Cannot mark a completed task as delayed');
    }
    this._status = MilestoneTaskStatus.DELAYED;
    this._updatedAt = new Date();
  }

  updateChecklist(checklist: ChecklistStep[]): void {
    this._checklist = [...checklist];
    this._updatedAt = new Date();
  }

  toggleChecklistStep(stepIndex: number): void {
    if (stepIndex < 0 || stepIndex >= this._checklist.length) {
      throw new Error('Invalid checklist step index');
    }
    this._checklist = this._checklist.map((step, index) =>
      index === stepIndex ? step.toggle() : step
    );
    this._updatedAt = new Date();
  }

  equals(other: MilestoneTask): boolean {
    return this._id.equals(other._id);
  }
}
