import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StructureDashboardComponent } from './structure-dashboard.component';

describe('StructureDashboardComponent', () => {
  let component: StructureDashboardComponent;
  let fixture: ComponentFixture<StructureDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StructureDashboardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StructureDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
