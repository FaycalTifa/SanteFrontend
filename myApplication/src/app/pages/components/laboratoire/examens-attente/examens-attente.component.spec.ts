import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExamensAttenteComponent } from './examens-attente.component';

describe('ExamensAttenteComponent', () => {
  let component: ExamensAttenteComponent;
  let fixture: ComponentFixture<ExamensAttenteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExamensAttenteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExamensAttenteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
