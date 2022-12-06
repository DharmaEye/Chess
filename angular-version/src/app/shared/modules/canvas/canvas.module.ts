import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CanvasMainComponent } from './components/main/canvas-main.component';
import { CanvasComponent } from './components/canvas/canvas.component';
import { CanvasContextService } from './services/context-element.service';
import { CanvasDirective } from './directives/canvas.directive';



@NgModule({
  declarations: [
    CanvasMainComponent,
    CanvasComponent,
    CanvasDirective
  ],
  exports:[
    CanvasMainComponent
  ],
  imports: [
    CommonModule
  ],
  providers:[ CanvasContextService]
})
export class CanvasModule { }
