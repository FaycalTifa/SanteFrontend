import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportMedicamentsComponent } from './import-medicaments.component';

describe('ImportMedicamentsComponent', () => {
  let component: ImportMedicamentsComponent;
  let fixture: ComponentFixture<ImportMedicamentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ImportMedicamentsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportMedicamentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
