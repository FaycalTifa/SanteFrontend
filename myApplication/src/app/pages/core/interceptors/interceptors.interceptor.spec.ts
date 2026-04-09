import { TestBed } from '@angular/core/testing';

import { InterceptorsInterceptor } from './interceptors.interceptor';

describe('InterceptorsInterceptor', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      InterceptorsInterceptor
      ]
  }));

  it('should be created', () => {
    const interceptor: InterceptorsInterceptor = TestBed.inject(InterceptorsInterceptor);
    expect(interceptor).toBeTruthy();
  });
});
