import { TestBed } from '@angular/core/testing';

import { MedicamentImportService } from './medicament-import.service';

describe('MedicamentImportService', () => {
  let service: MedicamentImportService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MedicamentImportService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
