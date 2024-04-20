import { Maze } from "./maze.mjs";
export class WebApp {
  static cellSize = 10;
  static run() {
    const webApp = new WebApp();
    webApp.refreshMaze();
  }
  constructor() {
    this.sizeX = 51;
    this.sizeY = 31;
    this.maze = null;
    const numberInputWidth = document.getElementById("numberInputWidth");
    const numberInputHeight = document.getElementById("numberInputHeight");
    const buttonMakeMaze = document.getElementById("buttonMakeMaze");
    numberInputWidth.value = this.sizeX;
    numberInputHeight.value = this.sizeY;
    numberInputWidth.addEventListener("change", () => {
      const value = parseInt(numberInputWidth.value);
      if (value % 2 !== 0) {
        this.sizeX = value;
      } else {
        if (value < this.sizeX) {
          this.sizeX = value - 1;
        } else {
          this.sizeX = value + 1;
        }
        numberInputWidth.value = `${this.sizeX}`;
      }
    });
    numberInputHeight.addEventListener("change", () => {
      const value = parseInt(numberInputHeight.value);
      if (value % 2 !== 0) {
        this.sizeY = value;
      } else {
        if (value < this.sizeY) {
          this.sizeY = value - 1;
        } else {
          this.sizeY = value + 1;
        }
        numberInputHeight.value = `${this.sizeY}`;
      }
    });
    buttonMakeMaze.addEventListener("click", () => {
      this.refreshMaze();
    });
  }
  refreshMaze() {
    const mazeElement = document.getElementById("maze");
    while (mazeElement.firstElementChild) {
      mazeElement.firstElementChild.remove();
    }
    setTimeout(() => {
      this.maze = this.newMaze();
      this.drawMaze();
      this.canvas = this.drawMaze();
      mazeElement.appendChild(this.canvas);
    }, 0);
  }
  newMaze() {
    const maze = new Maze(this.sizeX, this.sizeY);
    maze.setStartPosition(0, 1);
    maze.setGoalPosition(this.sizeX - 1, this.sizeY - 2);
    maze.createRandomMaze();
    return maze;
  }
  drawMaze() {
    // 迷路を描くCanvasを準備
    const canvas = document.createElement("canvas");
    canvas.setAttribute("width", `${this.sizeX * WebApp.cellSize}px`);
    canvas.setAttribute("height", `${this.sizeY * WebApp.cellSize}px`);
    const ctx = canvas.getContext("2d");
    // 迷路を描く
    for (let y = 0; y < this.sizeY; y++) {
      for (let x = 0; x < this.sizeX; x++) {
        if (!this.maze.isAisle(x, y)) {
          // 壁
          this.drawBlock(ctx, x, y, "#800", "#ddd");
        } else {
          // 通路
          this.drawBlock(ctx, x, y, "#ccc", "#ddd");
          if (this.maze.isStart(x, y)) {
            // スタート
            this.drawText(ctx, x, y, "S", "#00a", "#00f");
          } else if (this.maze.isGoal(x, y)) {
            // ゴール
            this.drawText(ctx, x, y, "G", "#a00", "#f00");
          } else {
          }
        }
      }
    }
    return canvas;
  }
  // レンガ積みのようなパターンを描く
  drawBlock(ctx, x, y, color, backColor) {
    const blockCanvas = document.createElement("canvas");
    blockCanvas.setAttribute("width", `${WebApp.cellSize}px`);
    blockCanvas.setAttribute("height", `${WebApp.cellSize}px`);

    const blockCtx = blockCanvas.getContext("2d");
    blockCtx.fillStyle = backColor;
    blockCtx.fillRect(0, 0, WebApp.cellSize, WebApp.cellSize);

    const hs = Math.floor(WebApp.cellSize / 2);
    const putBric = (x, y) => {
      blockCtx.fillRect(x, y, WebApp.cellSize - 1, hs - 1);
    }

    const xofs = Math.floor(WebApp.cellSize / 4);
    blockCtx.fillStyle = color;
    putBric(-xofs, 0);
    putBric(-xofs + WebApp.cellSize, 0);
    putBric(-xofs - hs, hs);
    putBric(-xofs - hs + WebApp.cellSize, hs);
    const xx = x * WebApp.cellSize;
    const yy = y * WebApp.cellSize;
    ctx.putImageData(blockCtx.getImageData(0, 0, WebApp.cellSize, WebApp.cellSize), xx, yy);
  }
  drawText(ctx, x, y, text, fillColor, strokeColor) {
    const xx = x * WebApp.cellSize;
    const yy = y * WebApp.cellSize;
    const fontHeight = WebApp.cellSize;
    const offsetBaseLine = Math.floor(WebApp.cellSize * 0.8);
    ctx.font = `bold ${fontHeight}px sans-serif`;
    ctx.strokeStyle = strokeColor;
    ctx.fillStyle = fillColor;
    ctx.strokeText(text, xx + 2, yy + offsetBaseLine);
    ctx.fillText(text, xx + 2, yy + offsetBaseLine);
  }
}