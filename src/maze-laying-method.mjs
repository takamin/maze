import { Maze } from "./maze.mjs";

export class MazeLayingMethod extends Maze {
  stickMapX = null;
  stickMapY = null;
  stickMapLength = null;
  stickIndex = null;
  init() {
    this.stickMapX = (this.sizeX - 3) / 2;
    this.stickMapY = (this.sizeY - 3) / 2;
    this.stickMapLength = this.stickMapX * this.stickMapY;
    this.stickIndex = 0;
  }
  /**
   * 棒倒し法で迷路を作成する
   */
  generate() {
    if(this.stickIndex >= this.stickMapLength) {
      return true; // 終了
    }
    const sx = this.stickIndex % this.stickMapX;
    const sy = Math.floor(this.stickIndex / this.stickMapX);
    this.stickIndex++;
    const x = sx * 2 + 2;
    const y = sy * 2 + 2;
    this.setWallAt(x, y);
    const direction = {
      top: { x: x, y: y - 1 },
      left: { x: x - 1, y: y },
      right: { x: x + 1, y: y },
      bottom: { x: x, y: y + 1 },
    }
    if (y > 2 || this.isWall(x, y - 1)) {
      delete direction.top;
    }
    if (x > 2 || this.isWall(x - 1, y)) {
      delete direction.left;
    }
    const dirCount = Object.keys(direction).length;
    const dirCoord = Object.values(direction);
    const dirIndex = Math.floor(Math.random() * dirCount);
    const { x: wallX, y: wallY } = dirCoord[dirIndex];
    this.setWallAt(wallX, wallY);
    return [{ x, y }, { x: wallX, y: wallY }];
  }
  static async run(argv) {
    const toNum = (arg) => {
      const n = parseInt(arg, 10);
      if (isNaN(n)) {
        return null;
      }
      return n;
    }
    const sizeX = toNum(argv.shift()) ?? 5;
    const sizeY = toNum(argv.shift()) ?? 5;
    const maze = new MazeLayingMethod(sizeX, sizeY);
    maze.setStartPosition(0, 1);
    maze.setGoalPosition(-1, -2);
    maze.generate();
    console.log(maze.toString());
  }
}
