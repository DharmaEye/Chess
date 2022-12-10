import { Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { CanvasDirective } from '../../directives/canvas.directive';
import { CanvasContextService } from '../../services/context-element.service';


@Component({
  selector: 'app-canvas',
  template: `
    <canvas [width]="canvasWidth" [height]="canvasHeight" appcanvas></canvas>
  `,
  styles: ['canvas { border-style: solid  }']
})
export class CanvasComponent implements OnInit, OnChanges {

  @Input() canvasWidth!:number;
  @Input() canvasHeight!:number;
  @Output() appCanvas = new EventEmitter<any>();

  @ViewChild(CanvasDirective, {static: true}) appcanvas!: CanvasDirective;
  private context!: CanvasRenderingContext2D;
  private native_element!: ElementRef<any>;

  constructor(private canvasContext:CanvasContextService) {}

  ngOnChanges(changes: SimpleChanges): void {
    this.native_element = this.appcanvas.htmlCanvasElement;
  }

  private initContext():void{
    this.context = this.canvasContext.initCanvas(this.appcanvas, '2d');
    const canvas = this.native_element.nativeElement;
    this.appCanvas.emit({ctx:this.context,canvas:canvas});
  }

  ngOnInit(): void {
    this.initContext();
  }

}
