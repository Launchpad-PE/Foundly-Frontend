import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteMilestoneModalComponent } from './delete-milestone-modal.component';

describe('DeleteMilestoneModalComponent', () => {
  let component: DeleteMilestoneModalComponent;
  let fixture: ComponentFixture<DeleteMilestoneModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeleteMilestoneModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DeleteMilestoneModalComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
