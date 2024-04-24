import { MazeDiggingMethod } from "./maze-digging-method.mjs";
import { MazeLayingMethod } from "./maze-laying-method.mjs";
import { MazeNoMaze } from "./maze-no-maze.mjs";
import { MazeResolver } from "./maze-resolver.mjs";
/**
 * @typedef {import("./maze.mjs").Maze} Maze
 */
export class WebApp {
  static cellSize = 11;
  static PathDotSize = 3;
  /**
   * @type {number}
   */
  sizeX;
  /**
   * @type {number}
   */
  sizeY;
  /**
   * @type {Maze}
   */
  maze;
  /**
   * @type {HTMLCanvasElement}
   */
  canvas;
  /**
   * @type {MazeResolver}
   */
  resolver;
  static async run() {
    const numberInputWidth = document.getElementById("numberInputWidth");
    const numberInputHeight = document.getElementById("numberInputHeight");
    const buttonMakeMazeLaying = document.getElementById("buttonMakeMazeLaying");
    const buttonMakeMazeDigging = document.getElementById("buttonMakeMazeDigging");
    const buttonResolve = document.getElementById("buttonResolve");

    let lastSizeX = parseInt(numberInputWidth.value);
    let lastSizeY = parseInt(numberInputHeight.value);

    const app = new WebApp();
    app.canvas = null;
    app.resolver = null;
    app.maze = new MazeNoMaze(lastSizeX, lastSizeY);
    await app.updateSize(lastSizeX, lastSizeY);

    numberInputWidth.addEventListener("change", () => {
      const value = parseInt(numberInputWidth.value);
      if (value % 2 !== 0) {
        lastSizeX = value;
      } else {
        if (value < lastSizeX) {
          numberInputHeight.value = `${value - 1}`;
        } else {
          numberInputHeight.value = `${value + 1}`;
        }
      }
    });
    numberInputHeight.addEventListener("change", () => {
      const value = parseInt(numberInputHeight.value);
      if (value % 2 !== 0) {
        lastSizeY = value;
      } else {
        if (value < lastSizeY) {
          numberInputHeight.value = `${value - 1}`;
        } else {
          numberInputHeight.value = `${value + 1}`;
        }
      }
    });
    buttonMakeMazeLaying.addEventListener("click", () => {
      app.maze = new MazeLayingMethod(app.sizeX, app.sizeY);
      app.updateSize(lastSizeX, lastSizeY);
    });
    buttonMakeMazeDigging.addEventListener("click", () => {
      app.maze = new MazeDiggingMethod(app.sizeX, app.sizeY);
      app.updateSize(lastSizeX, lastSizeY);
    });
    buttonResolve.addEventListener("click", async () => {
      await app.resolveMaze();
    });
  }
  async updateSize(sizeX, sizeY) {
    if (this.sizeX !== sizeX || this.sizeY !== sizeY) {
      this.sizeX = sizeX;
      this.sizeY = sizeY;
      this.refreshCanvas();
    }
    await this.clearMaze();
    await this.generateMaze();
    await this.refreshMaze();
  }
  refreshCanvas() {
    const mazeElement = document.getElementById("maze");
    while (mazeElement.firstElementChild) {
      mazeElement.firstElementChild.remove();
    }
    const canvas = document.createElement("canvas");
    canvas.setAttribute("width", `${this.sizeX * WebApp.cellSize}px`);
    canvas.setAttribute("height", `${this.sizeY * WebApp.cellSize}px`);
    this.canvas = canvas;
    mazeElement.appendChild(this.canvas);
  }
  async clearMaze() {
    await new Promise((resolve, reject) => {
      this.maze.init();
      this.drawMaze();
      resolve();
    });
  }
  async generateMaze() {
    await new Promise((resolve, reject) => {
      const createMaze = () => {
        try {
          const result = this.maze.generate();
          if (result === true) {
            clearInterval(tid);
            resolve();
          } else if (Array.isArray(result)) {
            result.forEach(({ x, y }) => this.drawCell(x, y));
          }
        } catch (err) {
          console.error(err);
          clearInterval(tid);
          reject(err);
        }
      }
      const tid = setInterval(createMaze, 1);
      createMaze();
    });
  }
  async refreshMaze() {
    this.maze.setStartPosition(0, 1);
    this.maze.setGoalPosition(this.sizeX - 1, this.sizeY - 2);
    this.drawMaze();
    this.resolver = new MazeResolver(this.maze);
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
        this.drawBlock(ctx, x, y, "#aaa", "#ddd");
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
    // 迷路を描く
    for (let y = 0; y < this.sizeY; y++) {
      for (let x = 0; x < this.sizeX; x++) {
        this.drawCell(x, y);
      }
    }
  }
  drawCell(x, y) {
    const ctx = this.canvas.getContext("2d");
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