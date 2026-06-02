import { MilestoneId } from '../value-objects/milestone-id.vo';
import { MilestoneTitle } from '../value-objects/milestone-title.vo';
import { MilestoneDescription } from '../value-objects/milestone-description.vo';
import { ProjectId } from '../value-objects/project-id.vo';
import { UserId } from '../value-objects/user-id.vo';
import { Tool } from '../value-objects/tool.vo';
import { Attachments } from '../value-objects/attachments.vo';
import { MilestoneStatus } from '../enum/milestone-status.enum';
import { MilestoneTask, CreateMilestoneTaskProps } from './milestone-task.entity';

export interface CreateMilestoneProps {
  id?: string;
  projectId: string;
  creatorId: string;
  title: string;
  description: string;
  dueDate: Date;
  tools?: string[];
  generalComment?: string;
  attachments?: string[];
  status?: MilestoneStatus;
  createdAt?: Date;
  updatedAt?: Date;
  tasks?: Omit<CreateMilestoneTaskProps, 'milestoneId'>[];
}

export class Milestone {
  private _id: MilestoneId;

  private constructor(
    milestoneId: MilestoneId,
    public readonly projectId: ProjectId,
    public readonly creatorId: UserId,
    public readonly title: MilestoneTitle,
    public readonly description: MilestoneDescription,
    private _tools: Tool[],
    private _generalComment: string | null,
    private _dueDate: Date,
    private _attachments: Attachments[],
    private _tasks: MilestoneTask[],
    private _status: MilestoneStatus,
    public readonly createdAt: Date,
    private _updatedAt: Date
  ) {
    this._id = milestoneId;
  }

  // Exponer id como string para cumplir con BaseEntity
  get id(): string {
    return this._id.toString();
  }

  // Método para obtener el value object cuando sea necesario
  get milestoneId(): MilestoneId {
    return this._id;
  }

  static create(props: CreateMilestoneProps): Milestone {
    const id = props.id ? MilestoneId.fromString(props.id) : MilestoneId.generate();
    const now = new Date();

    const milestone = new Milestone(
      id,
      ProjectId.fromString(props.projectId),
      new UserId(props.creatorId),
      new MilestoneTitle(props.title || ''),
      new MilestoneDescription(props.description || ''),
      (props.tools ?? []).map(name => new Tool(name)),
      props.generalComment?.trim() || null,
      props.dueDate || new Date(),
      (props.attachments ?? []).map(url => new Attachments(url)),
      [],
      props.status ?? MilestoneStatus.PENDING,
      props.createdAt ?? now,
      props.updatedAt ?? now
    );

    // Add tasks if provided (ahora sin milestoneId)
    if (props.tasks && props.tasks.length > 0) {
      for (const taskProps of props.tasks) {
        // Agregar el milestoneId aquí
        milestone.addTask({
          ...taskProps,
          milestoneId: milestone.id  // <-- Usar el ID del milestone recién creado
        });
      }
    }

    milestone._updateStatus();
    return milestone;
  }

  // Getters
  get tools(): Tool[] {
    return [...this._tools];
  }

  get generalComment(): string | null {
    return this._generalComment;
  }

  get dueDate(): Date {
    return this._dueDate;
  }

  get attachments(): Attachments[] {
    return [...this._attachments];
  }

  get tasks(): MilestoneTask[] {
    return [...this._tasks];
  }

  get status(): MilestoneStatus {
    return this._status;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  get isCompleted(): boolean {
    return this._status === MilestoneStatus.COMPLETED;
  }

  get isPending(): boolean {
    return this._status === MilestoneStatus.PENDING;
  }

  get isDelayed(): boolean {
    return this._status === MilestoneStatus.DELAYED;
  }

  get tasksCompletionPercentage(): number {
    if (this._tasks.length === 0) return 0;
    const completedCount = this._tasks.filter(t => t.isCompleted).length;
    return (completedCount / this._tasks.length) * 100;
  }

  // Task management
  addTask(taskProps: CreateMilestoneTaskProps): MilestoneTask {
    if (this.isCompleted) {
      throw new Error('Cannot add tasks to a completed milestone');
    }

    const task = MilestoneTask.create({
      ...taskProps,
      milestoneId: this.id
    });

    this._tasks.push(task);
    this._updatedAt = new Date();
    this._updateStatus();

    return task;
  }

  removeTask(taskId: string): void {
    const taskIndex = this._tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) {
      throw new Error('Task not found');
    }

    this._tasks.splice(taskIndex, 1);
    this._updatedAt = new Date();
    this._updateStatus();
  }

  completeTask(taskId: string): void {
    const task = this._tasks.find(t => t.id === taskId);
    if (!task) {
      throw new Error('Task not found');
    }

    task.complete();
    this._updatedAt = new Date();
    this._updateStatus();
  }

  reopenTask(taskId: string): void {
    if (this.isCompleted) {
      throw new Error('Cannot reopen tasks in a completed milestone');
    }

    const task = this._tasks.find(t => t.id === taskId);
    if (!task) {
      throw new Error('Task not found');
    }

    task.reopen();
    this._updatedAt = new Date();
    this._updateStatus();
  }

  // Milestone management
  private _updateStatus(): void {
    const now = new Date();

    // Si ya está completado, no cambiamos
    if (this._status === MilestoneStatus.COMPLETED) {
      return;
    }

    // Verificar si todas las tareas están completadas
    const allTasksCompleted = this._tasks.length > 0 &&
      this._tasks.every(task => task.isCompleted);

    if (allTasksCompleted) {
      this._status = MilestoneStatus.COMPLETED;
      this._updatedAt = new Date();
      return;
    }

    // Verificar si está atrasado (fecha pasada y no completado)
    if (now > this._dueDate) {
      this._status = MilestoneStatus.DELAYED;
      this._updatedAt = new Date();
      return;
    }

    // Si no está completado ni atrasado, está pendiente
    this._status = MilestoneStatus.PENDING;
    this._updatedAt = new Date();
  }

  reschedule(newDueDate: Date): void {
    if (this.isCompleted) {
      throw new Error('Cannot reschedule a completed milestone');
    }

    if (isNaN(newDueDate.getTime())) {
      throw new Error('Invalid due date');
    }

    this._dueDate = newDueDate;
    this._updatedAt = new Date();
    this._updateStatus();
  }

  updateGeneralComment(comment: string | null): void {
    this._generalComment = comment?.trim() || null;
    this._updatedAt = new Date();
  }

  addTool(toolName: string): void {
    if (this.isCompleted) {
      throw new Error('Cannot add tools to a completed milestone');
    }
    this._tools.push(new Tool(toolName));
    this._updatedAt = new Date();
  }

  removeTool(toolName: string): void {
    this._tools = this._tools.filter(t => t.getName() !== toolName);
    this._updatedAt = new Date();
  }

  addAttachment(url: string): void {
    if (this.isCompleted) {
      throw new Error('Cannot add attachments to a completed milestone');
    }
    this._attachments.push(new Attachments(url));
    this._updatedAt = new Date();
  }

  removeAttachment(url: string): void {
    this._attachments = this._attachments.filter(a => a.getValue() !== url);
    this._updatedAt = new Date();
  }

  equals(other: Milestone): boolean {
    return this._id.equals(other._id);
  }
}
