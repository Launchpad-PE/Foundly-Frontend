import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProfileStore } from '../../../application/profile.store';
import { UserStore } from '../../../../iam/application/user.store';
import { ProjectStore } from '../../../../project-management/application/project-store';
import { Experience } from '../../../domain/entities/experience.entity';
import { firstValueFrom } from 'rxjs';
import { CommentApi } from '../../../../comment-management/infrastructure/comment-api';
import { ProfileApi } from '../../../infrastructure/profile-api';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class ProfileComponent implements OnInit {
  private profileStore = inject(ProfileStore);
  private userStore = inject(UserStore);
  private projectStore = inject(ProjectStore);
  private commentApi = inject(CommentApi);
  private profileApi = inject(ProfileApi);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);

  profile = this.profileStore.currentProfile;
  loading = this.profileStore.loading;

  myProjects = this.projectStore.userProjects;
  favoriteProjects = this.projectStore.favoriteProjects;
  projectCount = 0;

  activeSection: 'projects' | 'comments' = 'projects';
  activeProjectTab: 'mine' | 'favorites' = 'mine';
  showExperiences = false;
  comments: any[] = [];

  // ── Edición de perfil ──────────────────────────────
  editMode = false;
  saving = false;
  editError: string | null = null;

  editUsername = '';
  editRole = '';
  editBio = '';

  newSkill = '';

  showExpForm = false;
  expDraft = { title: '', company: '', period: '', description: '', current: false };

  async ngOnInit(): Promise<void> {
    const userId = this.userStore.currentUser()?.id;
    if (!userId) {
      this.router.navigate(['/login']);
      return;
    }

    // Load profile
    if (!this.profile()) {
      await this.profileStore.loadProfile(userId.toString());
    }

    // Load projects
    await this.projectStore.loadUserProjects(userId.toString());
    this.projectCount = this.myProjects().length;

    // Load favorites
    await this.loadFavorites();

    // Load comments left on my profile
    await this.loadComments();
  }

  private async loadFavorites(): Promise<void> {
    const ids = this.profile()?.favoriteProjectIds ?? [];
    await this.projectStore.loadFavoriteProjects(ids);
  }

  /** Carga los comentarios que han dejado en mi perfil. */
  async loadComments(): Promise<void> {
    const userId = this.userStore.currentUser()?.id;
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
    this.comments = [...list];
    this.cdr.detectChanges();
  }

  toggleExperiences(): void {
    this.showExperiences = !this.showExperiences;
  }

  logout(): void {
    this.userStore.logout();
    this.router.navigate(['/login']);
  }

  viewProject(projectId: any): void {
    this.router.navigate(['/projects', projectId.toString()]);
  }

  viewProjectInfo(projectId: any): void {
    this.router.navigate(['/projects/info', projectId.toString()]);
  }

  async setProjectTab(tab: 'mine' | 'favorites'): Promise<void> {
    this.activeProjectTab = tab;
    if (tab === 'favorites') {
      await this.loadFavorites();
    }
  }

  /** Quita un proyecto de favoritos desde la lista del perfil. */
  async removeFavorite(projectId: any, event: Event): Promise<void> {
    event.stopPropagation();
    try {
      await this.profileStore.toggleFavorite(projectId.toString());
      this.projectStore.removeFavoriteLocal(projectId.toString());
    } catch (err: any) {
      console.error('Error al quitar favorito:', err);
    }
  }

  formatDate(date: Date | string | undefined): string {
    if (!date) return '';
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear().toString().slice(2);
    return `${day}/${month}/${year}`;
  }

  // ── Edición ────────────────────────────────────────

  enterEditMode(): void {
    const p = this.profile();
    if (!p) return;
    this.editUsername = p.username || '';
    this.editRole = p.role || '';
    this.editBio = p.bio || '';
    this.newSkill = '';
    this.showExpForm = false;
    this.resetExpDraft();
    this.editError = null;
    this.editMode = true;
  }

  cancelEditMode(): void {
    this.editMode = false;
    this.editError = null;
  }

  async saveBasicInfo(): Promise<void> {
    if (this.saving) return;
    const username = this.editUsername.trim();
    if (username.length < 3) {
      this.editError = 'El nombre de usuario debe tener al menos 3 caracteres';
      return;
    }

    this.saving = true;
    this.editError = null;
    try {
      await this.profileStore.updateBasicInfo({
        username,
        role: this.editRole.trim(),
        bio: this.editBio.trim(),
      });
      this.editMode = false;
    } catch (err: any) {
      this.editError = err?.message || 'No se pudieron guardar los cambios';
    } finally {
      this.saving = false;
    }
  }

  // Avatar
  onAvatarSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.editError = 'El archivo debe ser una imagen';
      return;
    }
    // ~1.5MB límite para evitar payloads enormes en json-server
    if (file.size > 1.5 * 1024 * 1024) {
      this.editError = 'La imagen es muy grande (máximo 1.5 MB)';
      input.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      this.saving = true;
      this.editError = null;
      try {
        await this.profileStore.updateAvatar(dataUrl);
      } catch (err: any) {
        this.editError = err?.message || 'No se pudo actualizar la foto';
      } finally {
        this.saving = false;
        input.value = '';
      }
    };
    reader.readAsDataURL(file);
  }

  async removeAvatar(): Promise<void> {
    this.saving = true;
    this.editError = null;
    try {
      await this.profileStore.updateAvatar(null);
    } catch (err: any) {
      this.editError = err?.message || 'No se pudo quitar la foto';
    } finally {
      this.saving = false;
    }
  }

  // Skills
  async addSkill(): Promise<void> {
    const skill = this.newSkill.trim();
    if (!skill || this.saving) return;
    if (this.profile()?.skills?.includes(skill)) {
      this.newSkill = '';
      return;
    }

    this.saving = true;
    this.editError = null;
    try {
      await this.profileStore.addSkill(skill);
      this.newSkill = '';
    } catch (err: any) {
      this.editError = err?.message || 'No se pudo agregar la habilidad';
    } finally {
      this.saving = false;
    }
  }

  async removeSkill(skill: string): Promise<void> {
    if (this.saving) return;
    this.saving = true;
    this.editError = null;
    try {
      await this.profileStore.removeSkill(skill);
    } catch (err: any) {
      this.editError = err?.message || 'No se pudo quitar la habilidad';
    } finally {
      this.saving = false;
    }
  }

  // Experiencias
  openExpForm(): void {
    this.resetExpDraft();
    this.showExpForm = true;
  }

  cancelExpForm(): void {
    this.showExpForm = false;
    this.resetExpDraft();
  }

  private resetExpDraft(): void {
    this.expDraft = { title: '', company: '', period: '', description: '', current: false };
  }

  async saveExperience(): Promise<void> {
    if (this.saving) return;
    if (!this.expDraft.title.trim() || !this.expDraft.company.trim()) {
      this.editError = 'El cargo y la empresa son obligatorios';
      return;
    }

    const newExp = new Experience({
      title: this.expDraft.title.trim(),
      company: this.expDraft.company.trim(),
      period: this.expDraft.period.trim(),
      description: this.expDraft.description.trim() || null,
      current: this.expDraft.current,
    });

    const current = this.profile()?.experiences ?? [];
    this.saving = true;
    this.editError = null;
    try {
      await this.profileStore.setExperiences([...current, newExp]);
      this.showExpForm = false;
      this.resetExpDraft();
      this.showExperiences = true;
    } catch (err: any) {
      this.editError = err?.message || 'No se pudo agregar la experiencia';
    } finally {
      this.saving = false;
    }
  }

  async removeExperienceAt(index: number): Promise<void> {
    if (this.saving) return;
    const current = this.profile()?.experiences ?? [];
    const next = current.filter((_, i) => i !== index);

    this.saving = true;
    this.editError = null;
    try {
      await this.profileStore.setExperiences(next);
    } catch (err: any) {
      this.editError = err?.message || 'No se pudo eliminar la experiencia';
    } finally {
      this.saving = false;
    }
  }
}
