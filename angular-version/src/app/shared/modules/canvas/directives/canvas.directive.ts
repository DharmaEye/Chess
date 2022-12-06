import { Directive, ElementRef } from '@angular/core';

@Directive({
  selector: '[appcanvas]'
})
export class CanvasDirective {
  constructor(public htmlCanvasElement: ElementRef<HTMLCanvasElement>) { }
}
