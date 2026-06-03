import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MilestoneDetailComponent } from './milestone-detail.component';

describe('MilestoneDetailComponent', () => {
  let component: MilestoneDetailComponent;
  let fixture: ComponentFixture<MilestoneDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MilestoneDetailComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MilestoneDetailComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
