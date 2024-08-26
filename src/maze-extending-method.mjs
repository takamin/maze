import { Maze } from "./maze.mjs";

export class MazeExtendingMethod extends Maze {
  stickMapX = null;
  stickMapY = null;
  stickMapLength = null;
  stickMap = null;
  stickIndex = null;
  init() {
    this.stickMapX = (this.sizeX - 3) / 2;
    this.stickMapY = (this.sizeY - 3) / 2;
    this.stickMapLength = this.stickMapX * this.stickMapY;
    this.stickMap = Array(this.stickMapLength).fill(null);
    this.stickIndex = null;
  }
  /**
   * 壁の起点となる支柱を立てる竪穴の数を返す。
   * すでに建てられている支柱の数は含まない。
   * @returns {number} 未設定の支柱の数
   */
  getStandingSticksCount() {
    const count = this.stickMap.filter((stick) => stick == null).length;
    return count;
  }
  /**
   * 壁を伸ばす始点をランダムに決定する
   * @param {number} standingSticks 秋状態の支柱の数
   * @returns {number}
   */
  getNextEmptyStickIndex(standingSticks) {
    const standingStickIndex = Math.floor(Math.random() * standingSticks);
    let nullCount = 0;
    for (let i = 0; i < this.stickMapLength; i++) {
      if (this.stickMap[i] == null) {
        if (nullCount === standingStickIndex) {
          return i;
        }
        nullCount++;
      }
    }
    return -1;
  }
  /**
   * 壁伸ばし法で迷路を作成する
   */
  generate() {
    // 倒していない棒の数
    const standingSticks = this.getStandingSticksCount();
    if (standingSticks === 0) {
      return true; // 終了
    }
    if(this.stickIndex == null) {
      this.stickIndex = this.getNextEmptyStickIndex(standingSticks);
    } else {
      if(this.stickIndex < 0 ||
        this.stickIndex >= this.stickMapLength ||
        this.stickMap[this.stickIndex] != null) {
        this.stickIndex = null;
        return false; // 新たな場所から壁を伸ばす
      }
    }
    this.stickMap[this.stickIndex] = true;
    const nextStickX = this.stickIndex % this.stickMapX;
    const nextStickY = Math.floor(this.stickIndex / this.stickMapX);
    const x = nextStickX * 2 + 2;
    const y = nextStickY * 2 + 2;
    this.setWallAt(x, y);
    const direction = {
      top: { x: 0, y: -1 },
      left: { x: -1, y: 0 },
      right: { x: +1, y: 0 },
      bottom: { x: 0, y: +1 },
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
    const d = dirCoord[dirIndex];
    const wallX = x + d.x;
    const wallY = y + d.y;
    this.setWallAt(wallX, wallY);

    this.stickIndex += d.y * this.stickMapX + d.x;
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
