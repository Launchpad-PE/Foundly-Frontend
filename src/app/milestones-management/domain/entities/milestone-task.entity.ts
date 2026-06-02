import { MilestoneId } from '../value-objects/milestone-id.vo';
import { MilestoneTaskDescription } from '../value-objects/milestone-task-description';
import { UserId } from '../value-objects/user-id.vo';
import { ChecklistStep } from '../value-objects/checklist-step.vo';
import { Attachments } from '../value-objects/attachments.vo';
import { MilestoneTaskStatus } from '../enum/milestone-task-status.vo';

export class MilestoneTasks {
  private readonly id: string;
  private readonly milestoneId: MilestoneId;
  private readonly title: string;
  private readonly description: MilestoneTaskDescription;
  public readonly assigneeId: UserId;
  private readonly checklist: ChecklistStep[];
  public readonly attachments: Attachments[];
  public readonly status: MilestoneTaskStatus.COMPLETED | MilestoneTaskStatus.PENDING;
  public readonly createdAt: Date;
  public updatedAt: Date;

  constructor(
    milestoneTaskId: string,
    milestoneId: MilestoneId,
    title: string,
    description: MilestoneTaskDescription,
    assigneeId: UserId,
    checklist: ChecklistStep[],
    attachments: Attachments[],
    status: MilestoneTaskStatus.COMPLETED | MilestoneTaskStatus.PENDING,
    createdAt: Date,
    updatedAt: Date
    ) {
      this.id = milestoneTaskId;
      this.milestoneId = milestoneId;
      this.title = title;
      this.description = description;
      this.assigneeId = assigneeId;
      this.checklist = checklist;
      this.attachments = attachments;
      this.status = status;
      this.createdAt = createdAt;
      this.updatedAt = updatedAt;
  }

}
