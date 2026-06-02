import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MilestoneTasksComponent, MilestoneTasksComponente } from './milestone-tasks.componente';

describe('MilestoneTasksComponent', () => {
  let component: MilestoneTasksComponent;
  let fixture: ComponentFixture<MilestoneTasksComponente>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MilestoneTasksComponente],
    }).compileComponents();

    fixture = TestBed.createComponent(MilestoneTasksComponente);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
