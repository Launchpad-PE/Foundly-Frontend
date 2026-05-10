import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoleStep } from './role-step';

describe('RoleStep', () => {
  let component: RoleStep;
  let fixture: ComponentFixture<RoleStep>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoleStep],
    }).compileComponents();

    fixture = TestBed.createComponent(RoleStep);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
