import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultationsAttenteComponent } from './consultations-attente.component';

describe('ConsultationsAttenteComponent', () => {
  let component: ConsultationsAttenteComponent;
  let fixture: ComponentFixture<ConsultationsAttenteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConsultationsAttenteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsultationsAttenteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
