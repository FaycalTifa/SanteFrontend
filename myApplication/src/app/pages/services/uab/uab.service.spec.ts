import { TestBed } from '@angular/core/testing';

import { UabService } from './uab.service';

describe('UabService', () => {
  let service: UabService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UabService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
