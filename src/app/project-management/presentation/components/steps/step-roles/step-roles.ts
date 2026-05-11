import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProjectFormData } from '../../../views/create-project/create-project';

interface RoleFormItem {
  id: string;
  name: string;
  cardTitle: string;
  items: string[];
  newItem: string;
}

@Component({
  selector: 'app-step-roles',
  standalone: true,  // ← Asegurar que está standalone
  imports: [CommonModule, FormsModule],  // ← CommonModule importado
  templateUrl: './step-roles.html',
  styleUrls: ['./step-roles.css']
})
export class StepRoles {
  @Input() formData!: ProjectFormData;
  @Output() update = new EventEmitter<Partial<ProjectFormData>>();

  newRole: RoleFormItem = {
    id: crypto.randomUUID(),
    name: '',
    cardTitle: '',
    items: [],
    newItem: '',
  };

  showRoleForm: boolean = false;

  addRoleItem(role: RoleFormItem): void {
    if (role.newItem.trim()) {
      role.items.push(role.newItem.trim());
      role.newItem = '';
    }
  }

  removeRoleItemFromList(roleIndex: number, itemIndex: number): void {
    const role = this.formData.roles[roleIndex];
    if (role) {
      const updatedItems = role.cardInfo.items.filter((_, i) => i !== itemIndex);
      const updatedRoles = [...this.formData.roles];
      updatedRoles[roleIndex] = {
        ...role,
        cardInfo: { ...role.cardInfo, items: updatedItems }
      };
      this.update.emit({ roles: updatedRoles });
    }
  }

  saveRole(): void {
    if (this.newRole.name.trim() && this.newRole.cardTitle.trim()) {
      const updatedRoles = [
        ...this.formData.roles,
        {
          name: this.newRole.name,
          cardInfo: {
            title: this.newRole.cardTitle,
            items: [...this.newRole.items],
          },
        },
      ];

      this.update.emit({ roles: updatedRoles });

      this.newRole = {
        id: crypto.randomUUID(),
        name: '',
        cardTitle: '',
        items: [],
        newItem: '',
      };
      this.showRoleForm = false;
    }
  }

  removeRole(index: number): void {
    const updatedRoles = this.formData.roles.filter((_, i) => i !== index);
    this.update.emit({ roles: updatedRoles });
  }

  cancelAddRole(): void {
    this.showRoleForm = false;
    this.newRole = {
      id: crypto.randomUUID(),
      name: '',
      cardTitle: '',
      items: [],
      newItem: '',
    };
  }
}
