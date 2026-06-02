import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MilestoneProgressComponent } from './my-milestone-progress.component';


describe('MyMilestoneProgressComponent', () => {
  let component: MilestoneProgressComponent;
  let fixture: ComponentFixture<MilestoneProgressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MilestoneProgressComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MilestoneProgressComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
