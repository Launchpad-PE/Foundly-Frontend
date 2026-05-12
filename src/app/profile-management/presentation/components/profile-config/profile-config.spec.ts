import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileConfig } from './profile-config';

describe('ProfileConfig', () => {
  let component: ProfileConfig;
  let fixture: ComponentFixture<ProfileConfig>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileConfig],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileConfig);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
