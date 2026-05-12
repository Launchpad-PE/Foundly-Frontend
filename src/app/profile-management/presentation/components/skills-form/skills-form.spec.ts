import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SkillsForm } from './skills-form';

describe('SkillsForm', () => {
  let component: SkillsForm;
  let fixture: ComponentFixture<SkillsForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SkillsForm],
    }).compileComponents();

    fixture = TestBed.createComponent(SkillsForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
