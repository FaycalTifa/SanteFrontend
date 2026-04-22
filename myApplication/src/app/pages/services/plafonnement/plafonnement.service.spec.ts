import { TestBed } from '@angular/core/testing';

import { PlafonnementService } from './plafonnement.service';

describe('PlafonnementService', () => {
  let service: PlafonnementService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlafonnementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
