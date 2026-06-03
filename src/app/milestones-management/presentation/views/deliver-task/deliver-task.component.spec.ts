import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeliverTaskComponent } from './deliver-task.component';

describe('DeliverTaskComponent', () => {
  let component: DeliverTaskComponent;
  let fixture: ComponentFixture<DeliverTaskComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeliverTaskComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DeliverTaskComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
