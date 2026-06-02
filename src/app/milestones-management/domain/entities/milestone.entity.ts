import { Tool } from '../value-objects/tool.vo';
import { Attachments } from '../value-objects/attachments.vo';
import { MilestoneId } from '../value-objects/milestone-id.vo';
import { MilestoneTitle } from '../value-objects/milestone-title.vo';
import { MilestoneDescription } from '../value-objects/milestone-description.vo';
import { MilestoneStatus } from '../enum/milestone-status.vo';
import { ProjectId } from '../value-objects/project-id.vo';
import { UserId } from '../value-objects/user-id.vo';
import { MilestoneTasks } from './milestone-task.entity';

export class Milestone {
  public readonly id: string;
  public readonly projectId: ProjectId;
  public readonly creatorId: UserId;
  public readonly title: MilestoneTitle;
  public readonly description: MilestoneDescription;
  public readonly tools: Tool[];
  public readonly generalComment: string;
  public dueDate: Date;
  public readonly attachments: Attachments[];
  public readonly MilestoneTasks: MilestoneTasks[];
  public status: MilestoneStatus.PENDING | MilestoneStatus.COMPLETED;
  public readonly createdAt: Date;
  public updatedAt: Date;


  private constructor(
      milestoneId: MilestoneId,
      projectId: ProjectId,
      title: MilestoneTitle,
      creatorId: UserId,
      description: MilestoneDescription,
      tools: Tool[],
      generalComment: string,
      dueDate: Date,
      attachments: Attachments[],
      milestoneTasks: MilestoneTasks[],
      status: MilestoneStatus.PENDING | MilestoneStatus.COMPLETED,
      createdAt: Date,
      updatedAt: Date
  ) {
      this.id = milestoneId.toString();
      this.projectId = projectId;
      this.title = title;
      this.creatorId = creatorId;
      this.description = description;
      this.tools = tools;
      this.generalComment = generalComment;
      this.status = status;
      this.dueDate = dueDate;
      this.attachments = attachments;
      this.MilestoneTasks = milestoneTasks;
      this.createdAt = createdAt;
      this.updatedAt = updatedAt;
  }
}
