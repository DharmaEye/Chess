import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CanvasMainComponent } from './canvas-main.component';

describe('HomeComponent', () => {
  let component: CanvasMainComponent ;
  let fixture: ComponentFixture<CanvasMainComponent >;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CanvasMainComponent  ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CanvasMainComponent );
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
