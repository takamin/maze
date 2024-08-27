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
   * @type {HTMLInputElement}
   */
  numberInputWidth;
  /**
   * @type {HTMLInputElement}
   */
  numberInputHeight;
  /**
   * @type {HTMLButtonElement}
   */
  buttonMakeMazeLaying;
  /**
   * @type {HTMLButtonElement}
   */
  buttonMakeMazeDigging;
  /**
   * @type {HTMLButtonElement}
   */
  buttonResolve;
  /**
   * @type {HTMLDivElement}
   */
  mazeContainer;

  constructor() {
    this.mazeContainer = document.getElementById("maze");

    this.numberInputWidth = document.getElementById("numberInputWidth");
    this.numberInputWidth.addEventListener("change",
      () => this.numberInputWidth_change());

    this.numberInputHeight = document.getElementById("numberInputHeight");
    this.numberInputHeight.addEventListener("change",
      () => this.numberInputHeight_change());

    this.buttonMakeMazeLaying = document.getElementById("buttonMakeMazeLaying");
    this.buttonMakeMazeLaying.addEventListener("click",
      () => this.setMaze(new MazeLayingMethod(this.lastInputSizeX, this.lastInputSizeY)));

    this.buttonMakeMazeDigging = document.getElementById("buttonMakeMazeDigging");
    this.buttonMakeMazeDigging.addEventListener("click",
      () => this.setMaze(new MazeDiggingMethod(this.lastInputSizeX, this.lastInputSizeY)));

    this.buttonResolve = document.getElementById("buttonResolve");
    this.buttonResolve.addEventListener("click",
      async () => await this.buttonResolve_click());

    this.lastInputSizeX = parseInt(this.numberInputWidth.value);
    this.lastInputSizeY = parseInt(this.numberInputHeight.value);
    this.canvas = null;
  }
  async init() {
    const maze = new MazeNoMaze(this.lastInputSizeX, this.lastInputSizeY)
    await this.setMaze(maze);
  }
  disableUI(state) {
    this.numberInputWidth.disabled = state;
    this.numberInputHeight.disabled = state;
    this.buttonMakeMazeLaying.disabled = state;
    this.buttonMakeMazeDigging.disabled = state;
    this.buttonResolve.disabled = state;
    const cursor = state ? "wait" : "default";
    document.body.style.cursor = cursor;
    this.numberInputWidth.style.cursor = cursor;
    this.numberInputHeight.style.cursor = cursor;
    this.buttonMakeMazeLaying.style.cursor = cursor;
    this.buttonMakeMazeDigging.style.cursor = cursor;
    this.buttonResolve.style.cursor = cursor;
  }
  numberInputWidth_change() {
    const value = parseInt(this.numberInputWidth.value);
    if (value !== this.lastInputSizeX) {
      const min = parseInt(this.numberInputWidth.min);
      if (value < min) {
        this.numberInputWidth.value = min;
        this.lastInputSizeX = min;
      } else if (value % 2 !== 0) {
        this.lastInputSizeX = value;
      } else {
        if (value < this.lastInputSizeX) {
          this.numberInputWidth.value = `${value - 1}`;
          this.lastInputSizeX = value - 1;
        } else {
          this.numberInputWidth.value = `${value + 1}`;
          this.lastInputSizeX = value + 1;
        }
      }
    }
  }
  numberInputHeight_change() {
    const value = parseInt(this.numberInputHeight.value);
    if (value !== this.lastInputSizeY) {
      const min = parseInt(this.numberInputHeight.min);
      if (value < min) {
        this.numberInputHeight.value = min;
        this.lastInputSizeY = min;
      } else if (value % 2 !== 0) {
        this.lastInputSizeY = value;
      } else {
        if (value < this.lastInputSizeY) {
          this.numberInputHeight.value = `${value - 1}`;
          this.lastInputSizeY = value - 1;
        } else {
          this.numberInputHeight.value = `${value + 1}`;
          this.lastInputSizeY = value + 1;
        }
      }
    }
  }
  async buttonResolve_click() {
    try {
      this.disableUI(true);
      const resolver = new MazeResolver(this.maze);
      await this.buryDeadEndAll(resolver);
      await this.walkThroughout(resolver);
    } catch(err) {
      alert(err);
    } finally {
      this.disableUI(false);
    }
  }
  /**
   * 新しい迷路を作成する
   * @param {Maze} maze 
   */
  async setMaze(maze) {
    this.disableUI(true);
    this.maze = maze;
    if (this.sizeX !== maze.sizeX || this.sizeY !== maze.sizeY) {
      this.sizeX = maze.sizeX;
      this.sizeY = maze.sizeY;
      while (this.mazeContainer.firstElementChild) {
        this.mazeContainer.firstElementChild.remove();
      }
      this.canvas = document.createElement("canvas");
      this.canvas.setAttribute("width", `${this.sizeX * WebApp.cellSize}px`);
      this.canvas.setAttribute("height", `${this.sizeY * WebApp.cellSize}px`);
      this.mazeContainer.appendChild(this.canvas);
    }
    await this.clearMaze();
    await this.generateMaze();
    await this.refreshMaze();
    this.disableUI(false);
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
  }
  buryDeadEndAll(resolver) {
    return new Promise((resolve, reject) => {
      let tid = null;
      const beryDeadEnd1 = () => {
        try {
          const buried = resolver.buryDeadEnd();
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
  walkThroughout(resolver) {
    return new Promise((resolve, reject) => {
      let tid = null;
      const walkThrough1 = () => {
        try {
          const steps = resolver.walk();
          const paths = resolver.path.slice(-steps);
          this.drawPath(paths);
          const { x, y } = resolver.pos;
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