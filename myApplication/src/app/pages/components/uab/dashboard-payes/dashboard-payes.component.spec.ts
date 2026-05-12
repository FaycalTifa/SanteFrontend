import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardPayesComponent } from './dashboard-payes.component';

describe('DashboardPayesComponent', () => {
  let component: DashboardPayesComponent;
  let fixture: ComponentFixture<DashboardPayesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DashboardPayesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardPayesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
