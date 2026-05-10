import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DescriptionStep } from './description-step';

describe('DescriptionStep', () => {
  let component: DescriptionStep;
  let fixture: ComponentFixture<DescriptionStep>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DescriptionStep],
    }).compileComponents();

    fixture = TestBed.createComponent(DescriptionStep);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
