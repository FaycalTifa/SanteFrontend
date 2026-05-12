import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DossiersPayesComponent } from './dossiers-payes.component';

describe('DossiersPayesComponent', () => {
  let component: DossiersPayesComponent;
  let fixture: ComponentFixture<DossiersPayesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DossiersPayesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DossiersPayesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
