import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RescheduleMilestoneModalComponent } from './reschedule-milestone-modal.component';

describe('RescheduleMilestoneModalComponent', () => {
  let component: RescheduleMilestoneModalComponent;
  let fixture: ComponentFixture<RescheduleMilestoneModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RescheduleMilestoneModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RescheduleMilestoneModalComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
