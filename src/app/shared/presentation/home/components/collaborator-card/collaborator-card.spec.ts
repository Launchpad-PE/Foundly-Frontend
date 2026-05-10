import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollaboratorCard } from './collaborator-card';

describe('CollaboratorCard', () => {
  let component: CollaboratorCard;
  let fixture: ComponentFixture<CollaboratorCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CollaboratorCard],
    }).compileComponents();

    fixture = TestBed.createComponent(CollaboratorCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
