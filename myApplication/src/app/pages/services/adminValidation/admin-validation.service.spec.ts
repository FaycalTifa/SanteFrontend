import { TestBed } from '@angular/core/testing';

import { AdminValidationService } from './admin-validation.service';

describe('AdminValidationService', () => {
  let service: AdminValidationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdminValidationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
