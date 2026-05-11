import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollaboratorList } from './collaborator-list';

describe('CollaboratorList', () => {
  let component: CollaboratorList;
  let fixture: ComponentFixture<CollaboratorList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CollaboratorList],
    }).compileComponents();

    fixture = TestBed.createComponent(CollaboratorList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
