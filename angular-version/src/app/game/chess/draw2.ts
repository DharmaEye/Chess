import { GamePieceData } from "./game-piece-data";

export function initalDrawFromData2(data: GamePieceData[], ctx:any): void {
    for (let item in data) {
      let dataItem = data[item];
      let image = new Image();
      image.src = dataItem.img;
      const loadImage = () => {
        ctx.drawImage(
          image,
          dataItem.x,
          dataItem.y,
          dataItem.width,
          dataItem.height
        );
      };
      if (image.complete) {
        loadImage();
      } else {
        image.onload = () => {
          loadImage();
        };
      }
    }
  }