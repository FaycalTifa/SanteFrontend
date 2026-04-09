import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InterpretationResultatsComponent } from './interpretation-resultats.component';

describe('InterpretationResultatsComponent', () => {
  let component: InterpretationResultatsComponent;
  let fixture: ComponentFixture<InterpretationResultatsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InterpretationResultatsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InterpretationResultatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
