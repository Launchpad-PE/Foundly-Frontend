import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';

export interface RoleFormData {
  selectedRole: string;
  customRole: string;
}

@Component({
  selector: 'app-role-form',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './role-form.html',
  styleUrls: ['./role-form.css']
})
export class RoleFormComponent {
  @Input() modelValue: RoleFormData = { selectedRole: '', customRole: '' };
  @Output() modelValueChange = new EventEmitter<RoleFormData>();
  @Output() next = new EventEmitter<void>();
  @Output() prev = new EventEmitter<void>();

  customRoleValue = '';

  predefinedRoles = [
    'Desarrollador Frontend', 'Desarrollador Backend', 'Diseñador UI/UX',
    'Project Manager', 'Data Scientist', 'DevOps Engineer',
    'Product Owner', 'QA Tester', 'Scrum Master',
    'Business Analyst', 'Mobile Developer', 'Full Stack Developer'
  ];

  selectRole(role: string): void {
    this.customRoleValue = '';
    this.modelValueChange.emit({ selectedRole: role, customRole: '' });
  }

  updateCustomRole(value: string): void {
    this.modelValueChange.emit({ selectedRole: '', customRole: value });
  }

  onSubmit(): void {
    if (this.modelValue.selectedRole || this.modelValue.customRole) {
      this.next.emit();
    }
  }
}
