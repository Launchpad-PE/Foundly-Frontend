import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StepSkillsDuration } from './step-skills-duration';

describe('StepSkillsDuration', () => {
  let component: StepSkillsDuration;
  let fixture: ComponentFixture<StepSkillsDuration>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StepSkillsDuration],
    }).compileComponents();

    fixture = TestBed.createComponent(StepSkillsDuration);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
