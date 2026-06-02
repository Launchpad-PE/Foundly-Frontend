import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyMilestoneTasksComponent } from './my-milestone-tasks.component';

describe('MyMilestoneTasksComponent', () => {
  let component: MyMilestoneTasksComponent;
  let fixture: ComponentFixture<MyMilestoneTasksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyMilestoneTasksComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MyMilestoneTasksComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
