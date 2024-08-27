import { Maze } from "./maze.mjs";

export class MazeLayingMethod extends Maze {
  stickMapX = null;
  stickMapY = null;
  stickMap = null;
  stickMapLength = null;
  init() {
    this.stickMapX = (this.sizeX - 3) / 2;
    this.stickMapY = (this.sizeY - 3) / 2;
    this.stickMapLength = this.stickMapX * this.stickMapY;
    this.stickMap = Array(this.stickMapLength).fill(null);
    // this.setWallAt(2, 2);
    // this.setWallAt(2, 3);
    // this.setWallAt(2, 4);
    // this.setWallAt(3, 2);
    // this.setWallAt(3, 4);
    // this.setWallAt(4, 2);
    // this.setWallAt(4, 3);
    // this.setWallAt(4, 4);
    // const closed = this.checkWallClosed([], 4, 4);
    // this.setAisleAt(4, 2);
    // this.setAisleAt(4, 3);
    // const canSet = this.canSetWall(4, 4 - 1, 4, 4 - 2);
    // const dir = this.getDirectionAt(4, 4);
    // console.log(JSON.stringify({closed, canSet, dir}));
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
  canSetWall(x, y, x2, y2) {
    if (this.isWall(x, y)) {
      return false;
    }
    const state = this.isWall(x, y);
    const state2 = this.isWall(x2, y2);
    try {
      this.setWallAt(x, y);
      this.setWallAt(x2, y2);
      const makeClosingWall = this.checkWallClosed([], x, y);
      if(makeClosingWall) {
        return false;
      }
    } finally {
      if(state) {
        this.setWallAt(x, y);
      } else {
        this.setAisleAt(x, y);
      }
      if(state2) {
        this.setWallAt(x2, y2);
      } else {
        this.setAisleAt(x2, y2);
      }
    }
    return true;
  }
  checkWallClosed(paths, x, y) {
    const lastPos = paths[paths.length - 1];
    const isLastPos = (x, y) => lastPos && lastPos.x === x && lastPos.y === y;

    if(paths.find((path) => path.x === x && path.y === y)) {
      // すでに通過済みのパスに戻った
      console.log(`CLOSED: ${JSON.stringify({x, y, paths})}`);
      return true; // 壁が閉じている(閉鎖空間がある)
    }
    const nextPaths = [...paths, { x, y }];

    const checkWallClosed = (x, y) => {
      if(isLastPos(x, y)) {
        // console.log(`LAST POSITION: ${JSON.stringify({x, y, paths: nextPaths})}`);
        return false;
      }
      if(x < 1 || x >= this.sizeX - 1 || y < 1 || y >= this.sizeY - 1) {
        // console.log(`OUT OF RANGE: ${JSON.stringify({x, y, paths: nextPaths})}`);
        return false;
      }
      if(!this.isWall(x, y)) {
        // console.log(`NOT A WALL: ${JSON.stringify({x, y, paths: nextPaths})}`);
        return false;
      }
      return this.checkWallClosed([...nextPaths], x, y);
    };
    return (
      checkWallClosed(x, y - 1) || // 上
      checkWallClosed(x - 1, y) || // 左
      checkWallClosed(x + 1, y) || // 右
      checkWallClosed(x, y + 1)    // 下
    );
  };
  getDirectionAt(x, y) {
    const direction = {
      top: { x: x, y: y - 1 },
      left: { x: x - 1, y: y },
      right: { x: x + 1, y: y },
      bottom: { x: x, y: y + 1 },
    }
    if (this.isWall(x, y - 1)) {
      delete direction.top;
    } else
    if (!this.canSetWall(x, y - 1, x, y - 2)) {
      delete direction.top;
    }
    if (!this.canSetWall(x - 1, y, x - 2, y)) {
      delete direction.left;
    }
    if (!this.canSetWall(x + 1, y, x + 2, y)) {
      delete direction.right;
    }
    if (!this.canSetWall(x, y + 1, x, y + 2)) {
      delete direction.bottom;
    }
    return direction;
  }
  /**
   * 棒倒し法で迷路を作成する
   */
  generate() {
    // 倒していない棒の数
    const standingSticks = this.getStandingSticksCount();
    if (standingSticks === 0) {
      return true; // 終了
    }
    const stickIndex = this.getNextEmptyStickIndex(standingSticks);
    this.stickMap[stickIndex] = true;
    const sx = stickIndex % this.stickMapX;
    const sy = Math.floor(stickIndex / this.stickMapX);
    const x = sx * 2 + 2;
    const y = sy * 2 + 2;
    this.setWallAt(x, y);
    const direction = this.getDirectionAt(x, y);
    const dirCount = Object.keys(direction).length;
    if(dirCount === 0) {
      return [{ x, y }];
    }
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
