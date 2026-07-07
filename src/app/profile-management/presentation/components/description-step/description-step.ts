import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';

export interface DescriptionStepData {
  bio: string;
}

@Component({
  selector: 'app-description-step',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './description-step.html',
  styleUrls: ['./description-step.css']
})
export class DescriptionStepComponent implements OnInit {
  @Input() modelValue: DescriptionStepData = { bio: '' };
  @Output() modelValueChange = new EventEmitter<DescriptionStepData>();
  @Output() complete = new EventEmitter<void>();
  @Output() prev = new EventEmitter<void>();

  bioText = '';

  ngOnInit(): void {
    this.bioText = this.modelValue.bio || '';
  }

  emitUpdate(): void {
    this.modelValueChange.emit({ bio: this.bioText });
  }
}
