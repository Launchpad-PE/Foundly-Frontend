import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyMilestoneProgressComponent } from './my-milestone-progress.component';

describe('MyMilestoneProgressComponent', () => {
  let component: MyMilestoneProgressComponent;
  let fixture: ComponentFixture<MyMilestoneProgressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyMilestoneProgressComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MyMilestoneProgressComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
