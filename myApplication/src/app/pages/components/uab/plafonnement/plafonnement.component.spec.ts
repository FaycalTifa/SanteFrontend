import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlafonnementComponent } from './plafonnement.component';

describe('PlafonnementComponent', () => {
  let component: PlafonnementComponent;
  let fixture: ComponentFixture<PlafonnementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlafonnementComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PlafonnementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
