export function initalDrawFromData(data: any, ctx:any): void {
    for (let item in data) {
      let dataItem = data[item];
      let image = new Image();
      image.src = dataItem["img"];
      const loadImage = () => {
        ctx.drawImage(
          image,
          dataItem["x"],
          dataItem["y"],
          dataItem["width"],
          dataItem["height"]
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