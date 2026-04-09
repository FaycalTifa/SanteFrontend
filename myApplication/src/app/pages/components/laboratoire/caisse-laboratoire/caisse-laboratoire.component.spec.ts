import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CaisseLaboratoireComponent } from './caisse-laboratoire.component';

describe('CaisseLaboratoireComponent', () => {
  let component: CaisseLaboratoireComponent;
  let fixture: ComponentFixture<CaisseLaboratoireComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaisseLaboratoireComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaisseLaboratoireComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
