import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StepEvironmental } from './step-evironmental';

describe('StepEvironmental', () => {
  let component: StepEvironmental;
  let fixture: ComponentFixture<StepEvironmental>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StepEvironmental],
    }).compileComponents();

    fixture = TestBed.createComponent(StepEvironmental);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
