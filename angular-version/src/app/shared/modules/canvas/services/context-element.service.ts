import { ElementRef, Injectable } from "@angular/core";
import { CanvasDirective } from "../directives/canvas.directive";


@Injectable({
  providedIn: "root",
})
export class CanvasContextService {
  private static canvasElementRef: ElementRef<HTMLCanvasElement>;
  private static context: CanvasRenderingContext2D;

  setCanvasElementRef(game: CanvasDirective, contextType: string) {
    CanvasContextService.canvasElementRef = game.htmlCanvasElement;
    CanvasContextService.context = <CanvasRenderingContext2D>(
      CanvasContextService.canvasElementRef.nativeElement.getContext(
        contextType
      )
    );
  }
  initCanvas(game: CanvasDirective, contextType: string) {
    this.setCanvasElementRef(game,contextType);
    return CanvasContextService.context;
  }

  constructor(){}
}
