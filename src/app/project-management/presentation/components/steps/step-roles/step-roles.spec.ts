import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StepRoles } from './step-roles';

describe('StepRoles', () => {
  let component: StepRoles;
  let fixture: ComponentFixture<StepRoles>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StepRoles],
    }).compileComponents();

    fixture = TestBed.createComponent(StepRoles);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
