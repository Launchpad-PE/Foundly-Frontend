import { ApplicationId } from '../value-objects/application-id.vo';
import { FullName } from '../value-objects/full-name.vo';
import { Email } from '../value-objects/email.vo';
import { UrlLink } from '../value-objects/url-link.vo';
import { PhoneNumber } from '../value-objects/phone-number.vo';
import { PresentationMessage } from '../value-objects/presentation-message.vo';
import { UserId } from '../value-objects/user-id.vo';
import { ProjectId } from '../value-objects/project-id.vo';
import { ApplicationStatus } from '../enum/application-status.enum';

/**
 * Postulación de un colaborador a un proyecto.
 *
 * Reglas de dominio:
 * - No se aceptan archivos PDF, solo enlaces (Drive, LinkedIn, Figma, etc.).
 * - El colaborador debe aceptar los términos para que la postulación NUEVA sea válida
 *   (la invariante se valida en `create()`, no en la rehidratación).
 * - El roleId debe corresponder a un rol existente en el proyecto.
 * - Una postulación solo puede aceptarse o rechazarse mientras está en PENDING.
 */
export class Application {
  public readonly id: string;
  public readonly projectId: ProjectId;
  public readonly userId: UserId;
  public readonly roleId: string;
  public readonly fullName: FullName;
  public readonly email: Email;
  public readonly portfolioUrl: UrlLink | null;
  public readonly phone: PhoneNumber | null;
  public readonly cvUrl: UrlLink;
  public readonly message: PresentationMessage;
  public readonly acceptedTerms: boolean;
  public status: ApplicationStatus;
  public readonly createdAt: Date;
  public updatedAt: Date;

  private constructor(
    applicationId: ApplicationId,
    projectId: ProjectId,
    userId: UserId,
    roleId: string,
    fullName: FullName,
    email: Email,
    portfolioUrl: UrlLink | null,
    phone: PhoneNumber | null,
    cvUrl: UrlLink,
    message: PresentationMessage,
    acceptedTerms: boolean,
    status: ApplicationStatus,
    createdAt: Date,
    updatedAt: Date
  ) {
    // Invariante estructural — debe cumplirse SIEMPRE (creación y rehidratación).
    if (!roleId || roleId.trim().length === 0) {
      throw new Error('A role must be selected');
    }

    this.id = applicationId.toString();
    this.projectId = projectId;
    this.userId = userId;
    this.roleId = roleId;
    this.fullName = fullName;
    this.email = email;
    this.portfolioUrl = portfolioUrl;
    this.phone = phone;
    this.cvUrl = cvUrl;
    this.message = message;
    this.acceptedTerms = acceptedTerms;
    this.status = status;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  /**
   * Factory para crear / rehidratar una postulación.
   * - Si `props.id` viene definido -> rehidratación (no se revalida acceptedTerms).
   * - Si `props.id` viene undefined -> nueva postulación, debe aceptar términos.
   */
  static create(props: {
    id?: string;
    projectId: string;
    userId: string;
    roleId: string;
    fullName: string;
    email: string;
    portfolioUrl?: string | null;
    phone?: string | null;
    cvUrl: string;
    message: string;
    acceptedTerms: boolean;
    status?: ApplicationStatus;
    createdAt?: string;
    updatedAt?: string;
  }): Application {
    const isNew = !props.id;

    if (isNew && !props.acceptedTerms) {
      throw new Error('You must accept the terms to apply');
    }

    const id = props.id ? ApplicationId.fromString(props.id) : ApplicationId.generate();

    const portfolio = props.portfolioUrl && props.portfolioUrl.trim().length > 0
      ? new UrlLink(props.portfolioUrl)
      : null;

    const phone = props.phone && props.phone.trim().length > 0
      ? new PhoneNumber(props.phone)
      : null;

    return new Application(
      id,
      ProjectId.fromString(props.projectId),
      new UserId(props.userId),
      props.roleId,
      new FullName(props.fullName),
      new Email(props.email),
      portfolio,
      phone,
      new UrlLink(props.cvUrl),
      new PresentationMessage(props.message),
      props.acceptedTerms,
      props.status ?? ApplicationStatus.PENDING,
      props.createdAt ? new Date(props.createdAt) : new Date(),
      props.updatedAt ? new Date(props.updatedAt) : new Date()
    );
  }

  /** Aceptar la postulación. Solo válido desde PENDING. */
  accept(): void {
    if (this.status !== ApplicationStatus.PENDING) {
      throw new Error(`Cannot accept an application in status '${this.status}'`);
    }
    this.status = ApplicationStatus.ACCEPTED;
    this.updatedAt = new Date();
  }

  /** Rechazar la postulación. Solo válido desde PENDING. */
  reject(): void {
    if (this.status !== ApplicationStatus.PENDING) {
      throw new Error(`Cannot reject an application in status '${this.status}'`);
    }
    this.status = ApplicationStatus.REJECTED;
    this.updatedAt = new Date();
  }

  isPending(): boolean { return this.status === ApplicationStatus.PENDING; }
  isAccepted(): boolean { return this.status === ApplicationStatus.ACCEPTED; }
  isRejected(): boolean { return this.status === ApplicationStatus.REJECTED; }
}
