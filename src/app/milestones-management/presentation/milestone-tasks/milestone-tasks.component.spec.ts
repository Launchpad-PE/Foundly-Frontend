import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MilestoneTasksComponent } from './milestone-tasks.component';


describe('MilestoneTasksComponent', () => {
  let component: MilestoneTasksComponent;
  let fixture: ComponentFixture<MilestoneTasksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MilestoneTasksComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MilestoneTasksComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
