import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrescriptionsAttenteComponent } from './prescriptions-attente.component';

describe('PrescriptionsAttenteComponent', () => {
  let component: PrescriptionsAttenteComponent;
  let fixture: ComponentFixture<PrescriptionsAttenteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PrescriptionsAttenteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PrescriptionsAttenteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
