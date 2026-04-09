import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TauxCouvertureComponent } from './taux-couverture.component';

describe('TauxCouvertureComponent', () => {
  let component: TauxCouvertureComponent;
  let fixture: ComponentFixture<TauxCouvertureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TauxCouvertureComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TauxCouvertureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
