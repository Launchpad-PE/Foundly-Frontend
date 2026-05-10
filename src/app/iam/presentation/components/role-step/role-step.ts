import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface RoleStepData {
  selectedRole: string;
  customRole: string;
}

@Component({
  selector: 'app-role-step',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './role-step.html',
  styleUrls: ['./role-step.css']
})
export class RoleStepComponent implements OnInit {
  @Input() modelValue: RoleStepData = { selectedRole: '', customRole: '' };
  @Output() modelValueChange = new EventEmitter<RoleStepData>();
  @Output() next = new EventEmitter<void>();
  @Output() prev = new EventEmitter<void>();

  customRoleValue = '';

  predefinedRoles = [
    'Desarrollador Frontend', 'Desarrollador Backend', 'Diseñador UI/UX',
    'Project Manager', 'Data Scientist', 'DevOps Engineer',
    'Product Owner', 'QA Tester', 'Scrum Master',
    'Business Analyst', 'Mobile Developer', 'Full Stack Developer'
  ];

  ngOnInit(): void {
    this.customRoleValue = this.modelValue.customRole || '';
  }

  selectRole(role: string): void {
    this.customRoleValue = '';
    this.modelValueChange.emit({ selectedRole: role, customRole: '' });
  }

  updateCustomRole(value: string): void {
    this.modelValueChange.emit({ selectedRole: '', customRole: value });
  }
}
