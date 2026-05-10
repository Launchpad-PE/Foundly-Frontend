import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalForgetPassword } from './modal-forget-password';

describe('ModalForgetPassword', () => {
  let component: ModalForgetPassword;
  let fixture: ComponentFixture<ModalForgetPassword>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalForgetPassword],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalForgetPassword);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
