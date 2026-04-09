import { TestBed } from '@angular/core/testing';

import { TauxCouvertureService } from './taux-couverture.service';

describe('TauxCouvertureService', () => {
  let service: TauxCouvertureService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TauxCouvertureService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
