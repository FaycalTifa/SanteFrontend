import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SaisieResultatsComponent } from './saisie-resultats.component';

describe('SaisieResultatsComponent', () => {
  let component: SaisieResultatsComponent;
  let fixture: ComponentFixture<SaisieResultatsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SaisieResultatsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SaisieResultatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
