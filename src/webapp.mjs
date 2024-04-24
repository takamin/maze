import { MazeLayingMethod } from "./maze-laying-method.mjs";
import { MazeResolver } from "./maze-resolver.mjs";
export class WebApp {
  static cellSize = 11;
  static PathDotSize = 3;
  static run() {
    const webApp = new WebApp();
    webApp.refreshMaze();
  }
  constructor() {
    this.sizeX = 51;
    this.sizeY = 31;
    this.maze = null;
    this.canvas = null;
    this.resolver = null;

    const numberInputWidth = document.getElementById("numberInputWidth");
    const numberInputHeight = document.getElementById("numberInputHeight");
    const buttonMakeMaze = document.getElementById("buttonMakeMaze");
    const buttonResolve = document.getElementById("buttonResolve");
    this.sizeX = parseInt(numberInputWidth.value);
    this.sizeY = parseInt(numberInputHeight.value);
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
    buttonResolve.addEventListener("click", async () => {
      await this.resolveMaze();
    });
  }
  refreshMaze() {
    setTimeout(() => {
      const mazeElement = document.getElementById("maze");
      while (mazeElement.firstElementChild) {
        mazeElement.firstElementChild.remove();
      }
      this.maze = new MazeLayingMethod(this.sizeX, this.sizeY);
      this.maze.setStartPosition(0, 1);
      this.maze.setGoalPosition(this.sizeX - 1, this.sizeY - 2);

      this.maze.createRandomMaze();

      const canvas = document.createElement("canvas");
      canvas.setAttribute("width", `${this.sizeX * WebApp.cellSize}px`);
      canvas.setAttribute("height", `${this.sizeY * WebApp.cellSize}px`);
      this.canvas = canvas;
      this.drawMaze();

      mazeElement.appendChild(this.canvas);

      this.resolver = new MazeResolver(this.maze);
    }, 0);
  }
  async resolveMaze() {
    await this.buryDeadEndAll();
    await this.walkThroughout();
  }
  buryDeadEndAll() {
    return new Promise((resolve, reject) => {
      let tid = null;
      const beryDeadEnd1 = () => {
        try {
          const buried = this.resolver.buryDeadEnd();
          if (buried.length === 0) {
            clearInterval(tid);
            resolve();
          }
          this.drawDeadEnd(buried);
        } catch (e) {
          console.error(e);
          clearInterval(tid);
          reject(e);
        }
      }
      tid = setInterval(beryDeadEnd1, 1);
      beryDeadEnd1();
    });
  }
  walkThroughout() {
    return new Promise((resolve, reject) => {
      let tid = null;
      const walkThrough1 = () => {
        try {
          const steps = this.resolver.walk();
          const paths = this.resolver.path.slice(-steps);
          this.drawPath(paths);
          const { x, y } = this.resolver.pos;
          if (this.maze.isGoal(x, y)) {
            clearInterval(tid);
            resolve();
          }
        } catch (e) {
          console.error(e);
          clearInterval(tid);
          reject(e);
        }
      }
      tid = setInterval(walkThrough1, 1);
      walkThrough1();
    });
  }
  drawDeadEnd(coords) {
    const ctx = this.canvas.getContext("2d");
    for (const { x, y } of coords) {
      if (this.maze.isAisle(x, y)) {
        this.drawBlock(ctx, x, y, "#000", "#ddd");
      }
    }
  }
  drawPath(coords) {
    const ctx = this.canvas.getContext("2d");
    for (const { x, y } of coords) {
      if (!this.maze.isStart(x, y) && !this.maze.isGoal(x, y)) {
        this.drawDot(ctx, x, y, "#00f", "#226");
      }
    }
  }
  drawMaze() {
    const ctx = this.canvas.getContext("2d");
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
  drawDot(ctx, x, y, color, backColor) {
    const dotSize = WebApp.PathDotSize;
    const mxy = Math.floor((WebApp.cellSize - dotSize) / 2);
    const xx = x * WebApp.cellSize + mxy;
    const yy = y * WebApp.cellSize + mxy;
    ctx.fillStyle = backColor;
    ctx.fillRect(xx + 1, yy + 1, dotSize, dotSize);
    ctx.fillStyle = color;
    ctx.fillRect(xx, yy, dotSize, dotSize);
  }
}