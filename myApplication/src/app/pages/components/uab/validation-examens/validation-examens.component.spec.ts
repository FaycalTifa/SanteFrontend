import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValidationExamensComponent } from './validation-examens.component';

describe('ValidationExamensComponent', () => {
  let component: ValidationExamensComponent;
  let fixture: ComponentFixture<ValidationExamensComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ValidationExamensComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ValidationExamensComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
