import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminValidationsComponent } from './admin-validations.component';

describe('AdminValidationsComponent', () => {
  let component: AdminValidationsComponent;
  let fixture: ComponentFixture<AdminValidationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminValidationsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminValidationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
