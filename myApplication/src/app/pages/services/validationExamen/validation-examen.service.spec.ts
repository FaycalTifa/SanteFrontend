import { TestBed } from '@angular/core/testing';

import { ValidationExamenService } from './validation-examen.service';

describe('ValidationExamenService', () => {
  let service: ValidationExamenService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ValidationExamenService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
