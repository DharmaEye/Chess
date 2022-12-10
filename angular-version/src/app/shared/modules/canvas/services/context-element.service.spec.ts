import { TestBed } from '@angular/core/testing';

import { CanvasContextService } from './context-element.service';

describe('ContextElementService', () => {
  let service: CanvasContextService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CanvasContextService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
