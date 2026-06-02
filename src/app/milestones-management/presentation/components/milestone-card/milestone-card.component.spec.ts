import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MilestoneCardComponent } from './milestone-card.component';

describe('MilestoneCardComponent', () => {
  let component: MilestoneCardComponent;
  let fixture: ComponentFixture<MilestoneCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MilestoneCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MilestoneCardComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
