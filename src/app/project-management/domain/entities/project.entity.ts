import { ProjectId } from '../value-objects/project-id.vo';
import { ProjectName } from '../value-objects/project-name.vo';
import { Summary } from '../value-objects/summary.vo';
import { Tag } from '../value-objects/tag.vo';
import { Area } from '../value-objects/area.vo';
import { EnvironmentalImpact, EnvironmentalMetric } from '../value-objects/environmental-impact.vo';
import { AcademicLevel } from '../value-objects/academic-level.vo';
import { Benefit } from '../value-objects/benefit.vo';
import { Skill } from '../value-objects/skill.vo';
import { Duration, DurationType } from '../value-objects/duration.vo';
import { CardItem, CardTitle, Role, RoleCardInfo, RoleName } from '../value-objects/role.vo';
import { UserId } from '../value-objects/user-id.vo';
import { ProjectStatus } from '../enum/project-status.enum';


export class Project  {
  public readonly id: string;
  public readonly name: ProjectName;
  public readonly area: Area;
  public readonly tags: Tag[];
  public readonly summary: Summary;
  public readonly environmentalImpact: EnvironmentalImpact | null;
  public readonly academicLevel: AcademicLevel | null;
  public readonly benefits: Benefit[];
  public readonly requiredSkills: Skill[];
  public readonly duration: Duration;
  public readonly roles: Role[];
  public status: ProjectStatus;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;
  public readonly authorId: UserId;

  private constructor(
    projectId: ProjectId,
    name: ProjectName,
    area: Area,
    tags: Tag[],
    summary: Summary,
    environmentalImpact: EnvironmentalImpact | null,
    academicLevel: AcademicLevel | null,
    benefits: Benefit[],
    requiredSkills: Skill[],
    duration: Duration,
    roles: Role[],
    status: ProjectStatus,
    createdAt: Date,
    updatedAt: Date,
    authorId: UserId
  ) {
    this.id = parseInt(projectId.toString(), 10).toString();
    this.name = name;
    this.area = area;
    this.tags = tags;
    this.summary = summary;
    this.environmentalImpact = environmentalImpact;
    this.academicLevel = academicLevel;
    this.benefits = benefits;
    this.requiredSkills = requiredSkills;
    this.duration = duration;
    this.roles = roles;
    this.status = status;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.authorId = authorId;
  }

  static create(props: {
    id?: string;
    name: string;
    area: string;
    tags: string[];
    summary: string;
    environmentalImpact?: EnvironmentalMetric[];
    academicLevel?: string | null;
    benefits: string[];
    requiredSkills: string[];
    duration: { amount: number; type: DurationType };
    roles: Array<{
      name: string;
      cardInfo: { title: string; items: string[] };
    }>;
    authorId: string;
    status?: ProjectStatus;
    createdAt?: string;
    updatedAt?: string;
  }): Project {
    const projectId = props.id ? ProjectId.fromString(props.id) : ProjectId.generate();

    return new Project(
      projectId,
      new ProjectName(props.name),
      new Area(props.area),
      props.tags.map(tag => new Tag(tag)),
      new Summary(props.summary),
      props.environmentalImpact ? new EnvironmentalImpact(props.environmentalImpact) : null,
      props.academicLevel !== undefined ? new AcademicLevel(props.academicLevel) : null,
      props.benefits.map(benefit => new Benefit(benefit)),
      props.requiredSkills.map(skill => new Skill(skill)),
      new Duration(props.duration.amount, props.duration.type),
      props.roles.map(role => new Role(
        new RoleName(role.name),
        new RoleCardInfo(
          new CardTitle(role.cardInfo.title),
          role.cardInfo.items.map(item => new CardItem(item))
        )
      )),
      props.status !== undefined ? props.status : ProjectStatus.DRAFT,
      props.createdAt ? new Date(props.createdAt) : new Date(),
      props.updatedAt ? new Date(props.updatedAt) : new Date(),
      new UserId(props.authorId)
    );
  }

  // Getter para acceder al ProjectId cuando sea necesario
  getProjectId(): string {
    return this.id;
  }

  addRole(role: Role): void {
    this.roles.push(role);
  }

  publish(): void {
    if (this.status === ProjectStatus.DRAFT) {
      this.status = ProjectStatus.PUBLISHED;
    }
  }

  updateName(name: string): void {
    Object.assign(this, { name: new ProjectName(name) });
  }

  updateSummary(summary: string): void {
    Object.assign(this, { summary: new Summary(summary) });
  }
}
