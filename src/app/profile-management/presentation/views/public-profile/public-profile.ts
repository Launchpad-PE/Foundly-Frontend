import { Component, OnInit, inject, signal, computed, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ProfileApi } from '../../../infrastructure/profile-api';
import { Profile } from '../../../domain/entities/profile.entity';
import { ProjectApi } from '../../../../project-management/infrastructure/project-api';
import { Project } from '../../../../project-management/domain/entities/project.entity';
import { FormsModule } from '@angular/forms';
import { CommentApi } from '../../../../comment-management/infrastructure/comment-api';
import { UserStore } from '../../../../iam/application/user.store';

@Component({
  selector: 'app-public-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './public-profile.html',
  styleUrl: './public-profile.css',
})
export class PublicProfileComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private profileApi = inject(ProfileApi);
  private projectApi = inject(ProjectApi);
  private commentApi = inject(CommentApi);
  private userStore = inject(UserStore);
  private cdr = inject(ChangeDetectorRef);

  profile = signal<Profile | null>(null);
  userProjects = signal<any[]>([]);
  loading = signal(true);
  projectsLoading = signal(false);

  showExperiences = false;
  activeTab: 'projects' | 'comments' = 'projects';
  showCommentBox = false;

  newComment = '';
  sendingComment = false;
  commentError: string | null = null;

  comments: any[] = [];

  /** True si el perfil que veo es el mío (no debería poder auto-comentarme). */
  isOwnProfile = computed(() => {
    const p = this.profile();
    const me = this.userStore.currentUser();
    return !!p && !!me && String(p.userId) === String(me.id);
  });

  async ngOnInit(): Promise<void> {
    const profileId = this.route.snapshot.params['id'];
    if (!profileId) {
      this.loading.set(false);
      return;
    }

    try {
      const p = await firstValueFrom(this.profileApi.getProfile(profileId));
      this.profile.set(p);
      console.log('📋 Perfil cargado:', p);
      console.log('📋 userId del perfil:', p?.userId);

      // Cargar los proyectos del usuario usando su userId
      if (p && p.userId) {
        await this.loadUserProjects(p.userId);
        await this.loadComments();
      } else {
        console.warn('⚠️ El perfil no tiene userId asociado');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      this.profile.set(null);
    } finally {
      this.loading.set(false);
    }
  }

  async loadUserProjects(userId: string): Promise<void> {
    this.projectsLoading.set(true);
    try {
      console.log(`🔍 Cargando proyectos para userId: ${userId}`);

      // Usar getProjectsByAuthorId que debería filtrar por authorId
      const projects = await firstValueFrom(this.projectApi.getProjectsByAuthorId(userId));

      console.log(`📊 Proyectos recibidos:`, projects);
      console.log(`📊 Cantidad: ${projects.length}`);

      // Verificar que los proyectos realmente pertenezcan a este usuario
      const validProjects = projects.filter((p) => {
        const authorId = p.authorId?.toString();
        const belongsToUser = authorId === userId;
        if (!belongsToUser) {
          console.warn(
            `⚠️ Proyecto ${p.id} - ${p.name?.getValue?.() || p.name} no pertenece al usuario ${userId} (authorId: ${authorId})`,
          );
        }
        return belongsToUser;
      });

      console.log(`✅ Proyectos válidos después del filtro: ${validProjects.length}`);

      // Transformar los proyectos a un formato plano para la vista
      const formattedProjects = validProjects.map((project) => ({
        id: project.id,
        name: project.name?.getValue ? project.name.getValue() : project.name,
        area: project.area?.getValue ? project.area.getValue() : project.area,
        roles: (project.roles || []).map((role: any) => ({
          name: role.name?.getValue ? role.name.getValue() : role.name,
        })),
      }));

      this.userProjects.set(formattedProjects);
    } catch (err) {
      console.error('❌ Error cargando proyectos del usuario:', err);
      this.userProjects.set([]);
    } finally {
      this.projectsLoading.set(false);
    }
  }

  toggleExperiences(): void {
    this.showExperiences = !this.showExperiences;
  }

  goBack(): void {
    this.router.navigate(['/home']);
  }

  /** Abre el chat con el dueño de este perfil. */
  messageUser(): void {
    const userId = this.profile()?.userId;
    if (userId) {
      this.router.navigate(['/messages'], { queryParams: { to: userId } });
    }
  }

  viewProjectDetails(projectId: string): void {
    this.router.navigate(['/projects/info', projectId]);
  }

  formatDate(date: Date | string | undefined): string {
    if (!date) return '';
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear().toString().slice(2);
    return `${day}/${month}/${year}`;
  }

  /** Carga los comentarios del perfil que se está viendo desde el backend. */
  async loadComments(): Promise<void> {
    const userId = this.profile()?.userId;
    if (!userId) return;

    try {
      const list = await firstValueFrom(this.commentApi.getComments(userId));
      const mapped = list.map((c) => ({
        authorId: c.authorId,
        authorName: `Usuario ${c.authorId}`,
        content: c.content,
        createdAt: c.createdAt,
      }));
      this.comments = mapped;
      this.cdr.detectChanges();
      // Resolver el nombre real de cada autor desde su perfil (sin bloquear el render)
      await this.resolveAuthorNames(mapped);
    } catch (err) {
      console.error('❌ Error cargando comentarios:', err);
      this.comments = [];
      this.cdr.detectChanges();
    }
  }

  /** Reemplaza "Usuario {id}" por el nombre del perfil de cada autor (best-effort). */
  private async resolveAuthorNames(list: any[]): Promise<void> {
    const uniqueIds = [...new Set(list.map((c) => c.authorId))];
    await Promise.all(
      uniqueIds.map(async (id) => {
        try {
          const authorProfile = await firstValueFrom(this.profileApi.getProfileByUserId(String(id)));
          const name = authorProfile?.username?.trim();
          if (name) {
            list.forEach((c) => {
              if (c.authorId === id) c.authorName = name;
            });
          }
        } catch {
          // El autor no tiene perfil: se queda con el fallback "Usuario {id}"
        }
      }),
    );
    this.comments = [...list]; // reasignar para refrescar la vista
    this.cdr.detectChanges();
  }

  /** Publica un comentario en el perfil que se está viendo. */
  async submitComment(): Promise<void> {
    const content = this.newComment.trim();
    if (!content) return;

    const targetUserId = this.profile()?.userId;
    if (!targetUserId) return;

    const authorId = this.userStore.currentUser()?.id;
    if (!authorId) {
      this.commentError = 'Debes iniciar sesión para dejar un comentario.';
      return;
    }

    if (String(authorId) === String(targetUserId)) {
      this.commentError = 'No puedes comentar en tu propio perfil.';
      return;
    }

    this.sendingComment = true;
    this.commentError = null;
    try {
      await firstValueFrom(this.commentApi.createComment(targetUserId, Number(authorId), content));
    } catch (err: any) {
      console.error('❌ Error enviando comentario:', err);
      this.commentError = err?.error?.message ?? 'No se pudo publicar el comentario.';
      this.sendingComment = false;
      this.cdr.detectChanges();
      return;
    }

    // Publicado con éxito: limpiar y cerrar el formulario de inmediato
    this.newComment = '';
    this.showCommentBox = false;
    this.sendingComment = false;
    this.activeTab = 'comments';
    this.cdr.detectChanges();

    // Recargar la lista en segundo plano (no bloquea el reseteo del botón)
    void this.loadComments();
  }
}
