import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DemandesAttenteComponent } from './demandes-attente.component';

describe('DemandesAttenteComponent', () => {
  let component: DemandesAttenteComponent;
  let fixture: ComponentFixture<DemandesAttenteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DemandesAttenteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DemandesAttenteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
