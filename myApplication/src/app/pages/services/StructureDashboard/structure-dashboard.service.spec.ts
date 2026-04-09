import { TestBed } from '@angular/core/testing';

import { StructureDashboardService } from './structure-dashboard.service';

describe('StructureDashboardService', () => {
  let service: StructureDashboardService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StructureDashboardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
