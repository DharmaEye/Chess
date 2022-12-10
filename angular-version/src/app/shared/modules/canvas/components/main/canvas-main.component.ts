import { Component, OnInit } from "@angular/core";
import { GameData } from "src/app/data/game-data";
import { GamePieceData } from "src/app/data/game-piece-data";

@Component({
  selector: "app-canvas-main",
  templateUrl: "./canvas-main.component.html",
  styleUrls: ["./canvas-main.component.scss"],
})
export class CanvasMainComponent implements OnInit {
  public guessX: number = 0;
  public guessY: number = 0;

  public CANVAS_WIDTH: number = 528;
  public CANVAS_HEIGHT: number = 528;
  private context: any;

  public yPos: number = 0;
  public xPos: number = 0;

  public colors!: Array<any>;
  private hoverColor!: Array<any>;
  public tableWidth = 66;

  private canClick!: boolean;
  private whoIam!: string;
  private turn!: any;

  public currentColorIndex = 0;
  public currentHoverColorIndex = 0;

  private canvas: any;
  private gamePieceData!: GamePieceData[];
  private gameData!: GameData;

  drawZone: any = [];
  canSetPosition: any = [];
  subscription: any;
  checkRefresh: boolean = false;

  loadedImages: any = [];
  imageCount:any = 0;
  IMG_SOURCE_FOLDER:string = "assets/img";
  IMG_PRELOAD_TIME:any = 100;

  getContext(c: any) {
    this.context = c.ctx;
    this.canvas = c.canvas;
  }

  img_sources = {
    bb: this.IMG_SOURCE_FOLDER + "/bb.png",
    bk: this.IMG_SOURCE_FOLDER + "/bk.png",
    bn: this.IMG_SOURCE_FOLDER + "/bn.png",
    bp: this.IMG_SOURCE_FOLDER + "/bp.png",
    bq: this.IMG_SOURCE_FOLDER + "/bq.png",
    br: this.IMG_SOURCE_FOLDER + "/br.png",
    wb: this.IMG_SOURCE_FOLDER + "/wb.png",
    wk: this.IMG_SOURCE_FOLDER + "/wk.png",
    wn: this.IMG_SOURCE_FOLDER + "/wn.png",
    wp: this.IMG_SOURCE_FOLDER + "/wp.png",
    wq: this.IMG_SOURCE_FOLDER + "/wq.png",
    wr: this.IMG_SOURCE_FOLDER + "/wr.png",
  };

  constructor() {}

  async ngOnInit() {
    this.preLoadImages(this.img_sources);
  }
  ngAfterViewInit() {
    this.initGame();
  }

  preLoadImages(sources: any): any {
    let count = 0;
    for (let src in sources) {
      ((index) => {
        count++;
        setTimeout(() => {
          let newImage = new Image();
          newImage.src = this.IMG_SOURCE_FOLDER + "/" + src + ".png";
          newImage.onload = () => {
              this.imageCount++;
              this.loadedImages[src] = {name:src,image:newImage};
              console.log('image ' + src + '.png loaded.');
          };
        }, this.IMG_PRELOAD_TIME * count);
      })(src);
    }
  }

  startGame(): void {
    var gameProcess = () => {
      if(this.imageCount == Object.keys(this.img_sources).length){
        this.drawTable();
        this.setEntryPositions(this.gameData.whitePos, this.gameData.blackPos);
      }
      window.requestAnimationFrame(gameProcess);
    };
    window.requestAnimationFrame(gameProcess);
  }

  setEntryPositions(self: any[], enemy: string | any[]): void {
    
    for (let i = 0; i < enemy.length; i++) {
      let item = enemy[i];
      this.context.drawImage(
        this.loadedImages[item.name].image, 
        item.x, 
        item.y, 
        item.width, 
        item.height);
    }

    const selfData = self.sort(function (a, b) {
      return a.zIndex - b.zIndex;
    });

    for (let i = 0; i < selfData.length; i++) {
      let item = selfData[i];
      this.context.drawImage(
        this.loadedImages[item.name].image, 
        item.x, 
        item.y, 
        item.width, 
        item.height);
    }
  }

  mouseClick(): void {
    let lastPositionX = 0;
    let lastPositionY = 0;
    var lastTouchedObj: {
      x: number;
      y: number;
      zIndex: number;
      isFirstMove: boolean;
    } | null;

    let x_el_pos = 0;
    let y_el_pos = 0;

    let mouseX = 0;
    let mouseY = 0;

    this.canvas.onmousemove = (e: any) => {
      mouseX = e.pageX;
      mouseY = e.pageY;

      if (lastTouchedObj === null || lastTouchedObj === void 0) {
        if (this.getPawnByMousePosition(mouseX, mouseY) !== null) {
          this.canvas.style.cursor = "-webkit-grab";
        } else {
          this.canvas.style.cursor = "default";
        }

        return;
      } else {
        this.canvas.style.cursor = "-webkit-grabbing";
      }

      lastTouchedObj.x = mouseX - x_el_pos;
      lastTouchedObj.y = mouseY - y_el_pos;
    };

    this.canvas.onmousedown = (e: {
      which: number;
      clientX: any;
      clientY: any;
    }) => {
      if (e.which !== 1 || !this.canClick) return;

      let entry = this.getPawnByMousePosition(e.clientX, e.clientY);

      if (entry === void 0 || entry === null) return;
      if (this.turn === "white" && entry.isEnemy) return;
      if (this.turn === "black" && !entry.isEnemy) return;

      lastTouchedObj = entry;

      lastPositionX = lastTouchedObj!.x;
      lastPositionY = lastTouchedObj!.y;

      x_el_pos = mouseX - lastTouchedObj!.x;
      y_el_pos = mouseY - lastTouchedObj!.y;

      lastTouchedObj!.x = mouseX - (mouseX - lastTouchedObj!.x);
      this.canvas.style.cursor = "-webkit-grabbing";

      lastTouchedObj!.zIndex = 10;

      this.showMovementAvailableWays(entry);
    };

    this.canvas.onmouseup = () => {
      if (lastTouchedObj === null || lastTouchedObj === void 0) return;

      this.canvas.style.cursor = "-webkit-grab";

      lastTouchedObj.zIndex = 1;

      var returnEntry = () => {
        this.slowReturn(lastTouchedObj, lastPositionX, lastPositionY);

        this.drawZone = [];
        this.canSetPosition = null;
        lastTouchedObj = null;
      };

      if (this.canSetPosition !== null && this.canSetPosition !== void 0) {
        var setEntry = (getPositionOfCurrentCel: { x: number; y: number }) => {
          if (
            getPositionOfCurrentCel.x + this.tableWidth >= mouseX &&
            getPositionOfCurrentCel.x <= mouseX &&
            getPositionOfCurrentCel.y + this.tableWidth >= mouseY &&
            getPositionOfCurrentCel.y <= mouseY
          ) {
            var enemy = this.getPawnByMousePositionFromEnemy(
              lastTouchedObj,
              getPositionOfCurrentCel.x,
              getPositionOfCurrentCel.y
            );

            if (enemy !== null && enemy !== undefined) {
              this.removeEnemy(enemy);
            }

            lastTouchedObj!.x = getPositionOfCurrentCel.x;
            lastTouchedObj!.y = getPositionOfCurrentCel.y;

            this.turn = this.turn === "white" ? "black" : "white";

            lastTouchedObj!.isFirstMove = false;
            lastTouchedObj = null;

            this.drawZone = [];
            this.canSetPosition = null;
          }
        };

        if (Array.isArray(this.canSetPosition)) {
          for (var r = 0; r < this.canSetPosition.length; r++) {
            var current = this.canSetPosition[r];

            var getPositionOfCurrentCel = this.getPosition(
              current.x + 1,
              current.y + 1
            );

            setEntry(getPositionOfCurrentCel);

            if (this.canSetPosition === null || this.canSetPosition === void 0)
              break;
          }

          returnEntry();
        } else {
          var getPositionOfCurrentCel = this.getPosition(
            this.canSetPosition.x + 1,
            this.canSetPosition.y + 1
          );
          setEntry(getPositionOfCurrentCel);
          returnEntry();
        }
      } else {
        returnEntry();
      }
    };
  }
  removeEnemy(enemy: any) {
    let enemyColor = enemy.img.substr(11, 11)[0] === "w" ? "white" : "black";

    let enemyPositions =
      enemyColor === "white"
        ? this.gameData["whitePos"]
        : this.gameData["blackPos"];

    if (enemyColor === "white") {
      this.gameData["whitePos"] = enemyPositions.filter(function (el: {
        x: any;
        y: any;
      }) {
        return !(el.x === enemy.x && el.y === enemy.y);
      });
    } else {
      this.gameData["blackPos"] = enemyPositions.filter(function (el: {
        x: any;
        y: any;
      }) {
        return !(el.x === enemy.x && el.y === enemy.y);
      });
    }
  }
  getPawnByMousePositionFromEnemy(
    character:
      | { x?: number; y?: number; zIndex?: number; isEnemy?: any }
      | null
      | undefined,
    x: number,
    y: number
  ) {
    var obj;

    if (character === null || character === undefined) return;

    var data = character.isEnemy
      ? this.gameData.whitePos
      : this.gameData.blackPos;

    for (var i = 0; i < data.length; i++) {
      var item = data[i];

      if (parseInt(item.x) === x && parseInt(item.y) === y) obj = item;
    }

    return obj;
  }

  slowReturn(obj: any, destX: any, destY: any) {
    let self = this;

    if (obj === null || obj === void 0) return;

    var left = obj.x,
      top = obj.y,
      dx = left - destX,
      dy = top - destY,
      i = 1,
      count = 20,
      delay = 20;

    const loop = () => {
      if (i >= count) {
        self.canClick = true;

        return;
      }

      i += 1;
      obj.x = (left - (dx * i) / count).toFixed(0);
      obj.y = (top - (dy * i) / count).toFixed(0);
      setTimeout(loop, delay);
      self.canClick = false;
    };

    loop();
  }
  showMovementAvailableWays(entry: any) {
    let entryPos = this.getCurrentEntryPos(entry);

    if (entryPos)
      switch (entry.character) {
        case "p":
          let pos: { x: number; y: number }[] = [];

          if (entry.isFirstMove) {
            if (
              entry.isEnemy &&
              this.canMovePos(entryPos.x, entryPos.y + 2) &&
              this.canMovePos(entryPos.x, entryPos.y + 1)
            ) {
              pos = [
                {
                  x: entryPos.x,
                  y: entryPos.y + 1,
                },
                {
                  x: entryPos.x,
                  y: entryPos.y + 2,
                },
              ];
            } else if (
              this.canMovePos(entryPos.x, entryPos.y - 2) &&
              !entry.isEnemy
            ) {
              pos = [
                {
                  x: entryPos.x,
                  y: entryPos.y - 1,
                },
                {
                  x: entryPos.x,
                  y: entryPos.y - 2,
                },
              ];
            } else if (
              this.canMovePos(entryPos.x, entryPos.y - 1) &&
              !entry.isEnemy
            ) {
              pos = [
                {
                  x: entryPos.x,
                  y: entryPos.y - 1,
                },
              ];
            } else if (
              this.canMovePos(entryPos.x, entryPos.y + 1) &&
              entry.isEnemy
            ) {
              pos = [
                {
                  x: entryPos.x,
                  y: entryPos.y + 1,
                },
              ];
            }
          } else {
            if (entry.isEnemy && this.canMovePos(entryPos.x, entryPos.y + 1)) {
              pos = [
                {
                  x: entryPos.x,
                  y: entryPos.y + 1,
                },
              ];
            } else if (
              this.canMovePos(entryPos.x, entryPos.y - 1) &&
              !entry.isEnemy
            ) {
              pos = [
                {
                  x: entryPos.x,
                  y: entryPos.y - 1,
                },
              ];
            }
          }
          this.drawZone = pos;
          this.canSetPosition = pos;

          this.getNearEnemyEntry(entry, entryPos.x - 1, entryPos.y - 1);
          this.getNearEnemyEntry(entry, entryPos.x + 1, entryPos.y - 1);
          this.getNearEnemyEntry(entry, entryPos.x - 1, entryPos.y + 1);
          this.getNearEnemyEntry(entry, entryPos.x + 1, entryPos.y + 1);

          break;
        case "n":
          this.canSetPosition = [];

          if (this.canMovePos(entryPos.x + 1, entryPos.y + 2)) {
            this.drawZone.push({
              x: entryPos.x + 1,
              y: entryPos.y + 2,
            });

            this.canSetPosition.push({
              x: entryPos.x + 1,
              y: entryPos.y + 2,
            });
          }

          if (this.canMovePos(entryPos.x + 1, entryPos.y - 2)) {
            this.drawZone.push({
              x: entryPos.x + 1,
              y: entryPos.y - 2,
            });

            this.canSetPosition.push({
              x: entryPos.x + 1,
              y: entryPos.y - 2,
            });
          }

          if (this.canMovePos(entryPos.x - 1, entryPos.y + 2)) {
            this.drawZone.push({
              x: entryPos.x - 1,
              y: entryPos.y + 2,
            });

            this.canSetPosition.push({
              x: entryPos.x - 1,
              y: entryPos.y + 2,
            });
          }

          if (this.canMovePos(entryPos.x - 1, entryPos.y - 2)) {
            this.drawZone.push({
              x: entryPos.x - 1,
              y: entryPos.y - 2,
            });

            this.canSetPosition.push({
              x: entryPos.x - 1,
              y: entryPos.y - 2,
            });
          }

          if (this.canMovePos(entryPos.x - 2, entryPos.y - 1)) {
            this.drawZone.push({
              x: entryPos.x - 2,
              y: entryPos.y - 1,
            });

            this.canSetPosition.push({
              x: entryPos.x - 2,
              y: entryPos.y - 1,
            });
          }

          if (this.canMovePos(entryPos.x + 2, entryPos.y - 1)) {
            this.drawZone.push({
              x: entryPos.x + 2,
              y: entryPos.y - 1,
            });

            this.canSetPosition.push({
              x: entryPos.x + 2,
              y: entryPos.y - 1,
            });
          }

          if (this.canMovePos(entryPos.x + 2, entryPos.y + 1)) {
            this.drawZone.push({
              x: entryPos.x + 2,
              y: entryPos.y + 1,
            });

            this.canSetPosition.push({
              x: entryPos.x + 2,
              y: entryPos.y + 1,
            });
          }

          if (this.canMovePos(entryPos.x - 2, entryPos.y + 1)) {
            this.drawZone.push({
              x: entryPos.x - 2,
              y: entryPos.y + 1,
            });

            this.canSetPosition.push({
              x: entryPos.x - 2,
              y: entryPos.y + 1,
            });
          }

          this.getNearEnemyEntry(entry, entryPos.x + 1, entryPos.y + 2);
          this.getNearEnemyEntry(entry, entryPos.x + 1, entryPos.y - 2);
          this.getNearEnemyEntry(entry, entryPos.x - 1, entryPos.y + 2);
          this.getNearEnemyEntry(entry, entryPos.x - 1, entryPos.y - 2);
          this.getNearEnemyEntry(entry, entryPos.x - 2, entryPos.y - 1);
          this.getNearEnemyEntry(entry, entryPos.x + 2, entryPos.y - 1);
          this.getNearEnemyEntry(entry, entryPos.x + 2, entryPos.y + 1);
          this.getNearEnemyEntry(entry, entryPos.x - 2, entryPos.y + 1);
          break;
        case "b":
          this.canSetPosition = [];

          var x = entryPos.x,
            y = entryPos.y;

          var self = this;

          var setTraits = (x: number, y: number) => {
            if (
              !self.canMovePos(x, y) &&
              !self.getNearEnemyEntry(entry, x, y)
            ) {
              return false;
            }

            self.drawZone.push({
              x: x,
              y: y,
            });

            self.canSetPosition.push({
              x: x,
              y: y,
            });

            if (self.getNearEnemyEntry(entry, x, y)) {
              return false;
            }

            return true;
          };

          for (var i = 0; i < 8 - entryPos.x; i++) {
            x++;
            y++;

            if (!setTraits(x, y)) break;
          }

          x = entryPos.x;
          y = entryPos.y;

          for (var i = 0; i < 8; i++) {
            x--;
            y++;

            if (!setTraits(x, y)) break;
          }

          x = entryPos.x;
          y = entryPos.y;

          for (var i = 0; i < 8; i++) {
            x++;
            y--;

            if (!setTraits(x, y)) break;
          }

          x = entryPos.x;
          y = entryPos.y;

          for (var i = 0; i < 8; i++) {
            x--;
            y--;

            if (!setTraits(x, y)) break;
          }

          break;
        case "r":
          var x = entryPos.x,
            y = entryPos.y;

          this.canSetPosition = [];

          for (var i = 0; i < 8; i++) {
            y++;

            if (!this.canMovePos(x, y) && !this.getNearEnemyEntry(entry, x, y))
              break;

            this.drawZone.push({
              x: x,
              y: y,
            });

            if (this.getNearEnemyEntry(entry, x, y)) break;

            this.canSetPosition.push({
              x: x,
              y: y,
            });
          }

          var x = entryPos.x,
            y = entryPos.y;

          for (var i = 0; i < 8; i++) {
            y--;

            if (!this.canMovePos(x, y) && !this.getNearEnemyEntry(entry, x, y))
              break;

            this.drawZone.push({
              x: x,
              y: y,
            });

            if (this.getNearEnemyEntry(entry, x, y)) break;

            this.canSetPosition.push({
              x: x,
              y: y,
            });
          }

          var x = entryPos.x,
            y = entryPos.y;

          for (var i = 0; i < 8; i++) {
            x++;

            if (!this.canMovePos(x, y) && !this.getNearEnemyEntry(entry, x, y))
              break;

            this.drawZone.push({
              x: x,
              y: y,
            });

            if (this.getNearEnemyEntry(entry, x, y)) break;

            this.canSetPosition.push({
              x: x,
              y: y,
            });
          }

          var x = entryPos.x,
            y = entryPos.y;

          for (var i = 0; i < 8; i++) {
            x--;

            if (!this.canMovePos(x, y) && !this.getNearEnemyEntry(entry, x, y))
              break;

            this.drawZone.push({
              x: x,
              y: y,
            });

            if (this.getNearEnemyEntry(entry, x, y)) break;

            this.canSetPosition.push({
              x: x,
              y: y,
            });
          }

          break;
        case "q":
          this.canSetPosition = [];

          var x = entryPos.x,
            y = entryPos.y;

          var self = this;

          var setTraitor = (x: number, y: number) => {
            if (!self.canMovePos(x, y) && !self.getNearEnemyEntry(entry, x, y))
              return false;

            self.drawZone.push({
              x: x,
              y: y,
            });

            self.canSetPosition.push({
              x: x,
              y: y,
            });

            if (self.getNearEnemyEntry(entry, x, y)) return false;

            return true;
          };

          for (var i = 0; i < 8; i++) {
            x++;

            if (!setTraitor(x, y)) break;
          }

          var x = entryPos.x,
            y = entryPos.y;

          for (var i = 0; i < 8; i++) {
            x--;

            if (!setTraitor(x, y)) break;
          }

          var x = entryPos.x,
            y = entryPos.y;

          for (var i = 0; i < 8; i++) {
            y++;

            if (!setTraitor(x, y)) break;
          }

          var x = entryPos.x,
            y = entryPos.y;

          for (var i = 0; i < 8; i++) {
            y--;

            if (!setTraitor(x, y)) break;
          }

          var x = entryPos.x,
            y = entryPos.y;

          for (var i = 0; i < 8; i++) {
            x++;
            y++;

            if (!setTraitor(x, y)) break;
          }

          var x = entryPos.x,
            y = entryPos.y;

          for (var i = 0; i < 8; i++) {
            x--;
            y++;

            if (!setTraitor(x, y)) break;
          }

          var x = entryPos.x,
            y = entryPos.y;

          for (var i = 0; i < 8; i++) {
            x--;
            y--;

            if (!setTraitor(x, y)) break;
          }

          var x = entryPos.x,
            y = entryPos.y;

          for (var i = 0; i < 8; i++) {
            x++;
            y--;

            if (!setTraitor(x, y)) break;
          }

          break;
        case "k":
          this.canSetPosition = [];

          if (this.canMovePos(entryPos.x - 1, entryPos.y)) {
            let pos = {
              x: entryPos.x - 1,
              y: entryPos.y,
            };

            this.drawZone.push(pos);
            this.canSetPosition.push(pos);
          }

          if (this.canMovePos(entryPos.x + 1, entryPos.y)) {
            let pos = {
              x: entryPos.x + 1,
              y: entryPos.y,
            };

            this.drawZone.push(pos);
            this.canSetPosition.push(pos);
          }

          if (this.canMovePos(entryPos.x, entryPos.y + 1)) {
            let pos = {
              x: entryPos.x,
              y: entryPos.y + 1,
            };

            this.drawZone.push(pos);
            this.canSetPosition.push(pos);
          }

          if (this.canMovePos(entryPos.x, entryPos.y - 1)) {
            let pos = {
              x: entryPos.x,
              y: entryPos.y - 1,
            };

            this.drawZone.push(pos);
            this.canSetPosition.push(pos);
          }

          if (this.canMovePos(entryPos.x + 1, entryPos.y + 1)) {
            let pos = {
              x: entryPos.x + 1,
              y: entryPos.y + 1,
            };

            this.drawZone.push(pos);
            this.canSetPosition.push(pos);
          }

          if (this.canMovePos(entryPos.x - 1, entryPos.y - 1)) {
            let pos = {
              x: entryPos.x - 1,
              y: entryPos.y - 1,
            };

            this.drawZone.push(pos);
            this.canSetPosition.push(pos);
          }

          if (this.canMovePos(entryPos.x - 1, entryPos.y + 1)) {
            let pos = {
              x: entryPos.x - 1,
              y: entryPos.y + 1,
            };

            this.drawZone.push(pos);
            this.canSetPosition.push(pos);
          }

          if (this.canMovePos(entryPos.x + 1, entryPos.y - 1)) {
            let pos = {
              x: entryPos.x + 1,
              y: entryPos.y - 1,
            };

            this.drawZone.push(pos);
            this.canSetPosition.push(pos);
          }

          break;
        default:
          break;
      }
  }
  getNearEnemyEntry(character: any, x: number, y: number) {
    let target = this.getEntryPosition(x, y);

    if (target !== null && !(character.isEnemy === target.isEnemy)) {
      this.drawZone.push({
        x: this.getCurrentEntryPos(target).x,
        y: this.getCurrentEntryPos(target).y,
      });

      this.canSetPosition.push({
        x: this.getCurrentEntryPos(target).x,
        y: this.getCurrentEntryPos(target).y,
      });

      return target;
    }

    return false;
  }
  getEntryPosition(x: number, y: number) {
    let entry = null;

    for (let i = 0; i < this.gameData.whitePos.length; i++) {
      let item = this.gameData.whitePos[i];
      let position = this.getCurrentEntryPos(item);

      if (position !== null && position.x === x && position.y === y)
        entry = item;
    }

    for (let i = 0; i < this.gameData.blackPos.length; i++) {
      let item = this.gameData.blackPos[i];
      let position = this.getCurrentEntryPos(item);

      if (position !== null && position.x === x && position.y === y)
        entry = item;
    }

    return entry;
  }
  canMovePos(x: number, y: number) {
    let objectPos = this.getPosition(x + 1, y + 1);

    let element = this.getPawnByMousePosition(objectPos.x + 1, objectPos.y + 1);

    if (element === null) return true;

    return false;
  }
  getPosition(x: number, y: any) {
    return {
      x: (x - 1) * this.tableWidth,
      y: (y - 1) * this.tableWidth,
    };
  }

  getCurrentEntryPos(obj: GamePieceData): any {
    if (obj === void 0 || obj === null) return null;

    let x = Math.round((obj.x - 1) / this.tableWidth),
      y = Math.round((obj.y - 1) / this.tableWidth);

    return {
      x: x < 0 ? 0 : x,
      y: y < 0 ? 0 : y,
    };
  }

  getPawnByMousePosition(x: number, y: number): any {
    let obj = null;

    for (let i = 0; i < this.gameData.whitePos.length; i++) {
      let item = this.gameData.whitePos[i];

      if (
        parseInt(item.x) + item.width >= x &&
        x >= parseInt(item.x) &&
        parseInt(item.y) + item.height >= y &&
        y >= item.y
      )
        obj = item;
    }

    for (let i = 0; i < this.gameData.blackPos.length; i++) {
      let item = this.gameData.blackPos[i];

      if (
        parseInt(item.x) + item.width >= x &&
        x >= parseInt(item.x) &&
        parseInt(item.y) + item.height >= y &&
        y >= item.y
      )
        obj = item;
    }

    return obj;
  }

  drawTable(): void {
    let currentColorIndex = 0;

    this.canvas.width = 8 * this.tableWidth;
    this.canvas.height = 8 * this.tableWidth;

    var self = this;

    var drawRect = function (color: any, x: number, y: number) {
      self.context.beginPath();
      self.context.fillStyle = color;
      self.context.rect(x, y, self.tableWidth, self.tableWidth);
      self.context.fill();
      self.context.closePath();
    };

    let yPos = 0;
    let currentHoverColorIndex = 0;

    for (let y = 0; y <= 8; y++) {
      let xPos = 0;

      for (let x = 0; x <= 8; x++) {
        drawRect(this.colors[currentColorIndex], xPos, yPos);

        if (this.drawZone.length > 0) {
          for (var j = 0; j < this.drawZone.length; j++) {
            var current = this.drawZone[j];

            if (y === current.y && x === current.x) {
              drawRect(this.hoverColor[currentHoverColorIndex], xPos, yPos);
            }
          }
        }

        xPos += this.tableWidth;

        currentHoverColorIndex = currentHoverColorIndex == 0 ? 1 : 0;
        currentColorIndex = currentColorIndex == 0 ? 1 : 0;
      }

      yPos += this.tableWidth;
    }
  }

  setBlackEntryData(): any {
    this.gamePieceData = [];

    let color = this.gameData["black"];
    let colorPawn = "bp";

    for (let s = 0; s < color.length; s++) {
      let current = color[s];

      if (current.x.length >= 1) {
        for (let i = 0; i < current.x.length; i++) {
          let xPosition = current.x[i];
          let width = (65 * this.tableWidth) / 65;
          let height = (65 * this.tableWidth) / 65;
          let xPosEntry = (xPosition - 1) * this.tableWidth;

          this.gamePieceData.push({
            x: xPosEntry,
            y: 0,
            width: width,
            height: height,
            img: this.IMG_SOURCE_FOLDER + "/" + current.img,
            character: current.img.substr(1, 1),
            name: 'b' + current.img.substr(1,1),
            zIndex: 1,
            isEnemy: true,
          });
        }
      } else {
        var width = (65 * this.tableWidth) / 65;
        var height = (65 * this.tableWidth) / 65;
        let xPosEntry = (current.x - 1) * this.tableWidth;

        this.gamePieceData.push({
          x: xPosEntry,
          y: 0,
          width: width,
          height: height,
          img: this.IMG_SOURCE_FOLDER + "/" + current.img,
          character: current.img.substr(1, 1),
          name: 'b' + current.img.substr(1,1),
          zIndex: 1,
          isEnemy: true,
        });
      }
    }

    // Pawns
    for (var s = 0; s < 8; s++) {
      let width = (65 * this.tableWidth) / 65;
      let height = (65 * this.tableWidth) / 65;
      this.gamePieceData.push({
        x: s * this.tableWidth,
        y: 1 * this.tableWidth,
        width: width,
        height: height,
        img: this.IMG_SOURCE_FOLDER + "/" + colorPawn + ".png",
        character: colorPawn.substr(1, 1),
        name: 'b' + colorPawn.substr(1,1),
        isFirstMove: true,
        zIndex: 1,
        isEnemy: true,
      });
    }
    return this.gamePieceData;
  }

  setWhiteEntryData() {
    this.gamePieceData = [];

    let color = this.gameData["white"];
    let colorPawn = "wp";

    for (let s = 0; s < color.length; s++) {
      let current = color[s];

      if (current.x.length >= 1) {
        for (let i = 0; i < current.x.length; i++) {
          let xPosition = current.x[i];
          let width = (65 * this.tableWidth) / 65;
          let height = (65 * this.tableWidth) / 65;
          let xPosEntry = (xPosition - 1) * this.tableWidth;

          this.gamePieceData.push({
            x: xPosEntry,
            y: (8 - 1) * this.tableWidth,
            width: width,
            height: height,
            img: this.IMG_SOURCE_FOLDER + "/" + current.img,
            character: current.img.substr(1, 1),
            name:'w' + current.img.substr(1,1),
            zIndex: 1,
            isEnemy: false,
          });
        }
      } else {
        let width = (65 * this.tableWidth) / 65;
        let height = (65 * this.tableWidth) / 65;
        let xPosEntry = (current.x - 1) * this.tableWidth;

        this.gamePieceData.push({
          x: xPosEntry,
          y: (8 - 1) * this.tableWidth,
          width: width,
          height: height,
          img: this.IMG_SOURCE_FOLDER + "/" + current.img,
          character: current.img.substr(1, 1),
          name:'w' + current.img.substr(1,1),
          zIndex: 1,
          isEnemy: false,
        });
      }
    }

    //Pawns
    for (let s = 0; s < 8; s++) {
      let width = (65 * this.tableWidth) / 65;
      let height = (65 * this.tableWidth) / 65;
      this.gamePieceData.push({
        x: s * this.tableWidth,
        y: 6 * this.tableWidth,
        width: width,
        height: height,
        img: this.IMG_SOURCE_FOLDER + "/" + colorPawn + ".png",
        character: colorPawn.substr(1, 1),
        name: 'w' + colorPawn.substr(1,1),
        isFirstMove: true,
        zIndex: 1,
        isEnemy: false,
      });
    }
    return this.gamePieceData;
  }

  setEntryData() {
    this.gameData.whitePos = this.setWhiteEntryData();
    this.gameData.blackPos = this.setBlackEntryData();
  }

  initGame(): void {
    this.colors = ["#769656", "#eeeed2"];
    this.hoverColor = ["#baca44", "#f6f682"];
    this.tableWidth = 66;

    this.canClick = true;

    this.gameData = {
      whitePos: [],
      blackPos: [],
      white: [
        {
          img: "wb.png",
          x: [3, 6],
          y: 0,
          isEnemy: false,
        },
        {
          img: "wk.png",
          x: 5,
          y: 0,
          isEnemy: false,
        },
        {
          img: "wq.png",
          x: 4,
          y: 0,
          isEnemy: false,
        },
        {
          img: "wn.png",
          x: [2, 7],
          y: 0,
          isEnemy: false,
        },
        {
          img: "wr.png",
          x: [1, 8],
          y: 0,
          isEnemy: false,
        },
      ],
      black: [
        {
          img: "bb.png",
          x: [3, 6],
          y: 0,
          isEnemy: true,
        },
        {
          img: "bk.png",
          x: 5,
          y: 0,
          isEnemy: true,
        },
        {
          img: "bq.png",
          x: 4,
          y: 0,
          isEnemy: true,
        },
        {
          img: "bn.png",
          x: [2, 7],
          y: 0,
          isEnemy: true,
        },
        {
          img: "br.png",
          x: [1, 8],
          y: 0,
          isEnemy: true,
        },
      ],
    };

    this.whoIam = "white";

    this.turn = this.whoIam;
    this.setEntryData();
    this.mouseClick();
    this.startGame();
  }
}
