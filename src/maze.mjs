export class Maze {
  /** 通路 */
  static Aisle = 0;
  /** 壁 */
  static Wall = 1;
  /** スタート位置(通路でもある) */
  static Start = 2;
  /** ゴール位置(通路でもある) */
  static Goal = 4;
  /**
   * 
   * @param {number} sizeX 
   * @param {number} sizeY 
   */
  constructor(sizeX, sizeY) {
    this.sizeX = sizeX;
    this.sizeY = sizeY;
    this.map = Maze.createMap(sizeX, sizeY);
    this.startX = null;
    this.startY = null;
    this.goalX = null;
    this.goalY = null;
  }
  /**
   * 引数で指定されたサイズのマップを作成する。
   * 返されるマップの外周は壁で埋められており内部はすべて通路となる。
   * @param {number} sizeX 
   * @param {number} sizeY 
   * @returns 
   */
  static createMap(sizeX, sizeY) {
    const fieldSizeX = sizeX;
    const fieldSizeY = sizeY;
    const fieldBottomEndY = fieldSizeY - 1;
    const fieldRightEndX = fieldSizeX - 1;

    // マップを作成：2次元配列
    const map = (new Array(fieldSizeY)).fill(null).map(
      () => (new Array(fieldSizeX)).fill(null).map(() => Maze.Aisle));

    // 南北の端を全部壁とする
    for (let x = 0; x < fieldSizeX; x++) {
      map[0][x] = Maze.Wall;
      map[fieldBottomEndY][x] = Maze.Wall;
    }
    // 東西の端を全部壁とする
    for (let y = 0; y < fieldSizeY; y++) {
      map[y][0] = Maze.Wall;
      map[y][fieldRightEndX] = Maze.Wall;
    }
    return map;
  }
  /**
   * 入口を指定する
   * @param {number} startX 
   * @param {number} startY 
   */
  setStartPosition(startX, startY) {
    this.startX = startX >= 0 ? startX : this.sizeX + startX;
    this.startY = startY >= 0 ? startY : this.sizeY + startY;
    this.map[this.startY][this.startX] = Maze.Start;
  }
  /**
   * 出口を指定する
   * @param {number} goalX 
   * @param {number} goalY 
   */
  setGoalPosition(goalX, goalY) {
    this.goalX = goalX >= 0 ? goalX : this.sizeX + goalX;
    this.goalY = goalY >= 0 ? goalY : this.sizeY + goalY;
    this.map[this.goalY][this.goalX] = Maze.Goal;
  }
  /**
   * 指定座標が通路かどうか判定する
   * @param {number} x 
   * @param {number} y 
   * @param {number} startX = 0
   * @return {boolean}
   */
  isAisle(x, y) {
    const state = this.map[y][x];
    const aisle =
      state === Maze.Aisle ||
      state === Maze.Start ||
      state === Maze.Goal;
    return aisle;
  }
  /**
   * 指定座標がスタート位置かどうか判定する
   * @param {number} x 
   * @param {number} y 
   * @return {boolean}
   */
  isStart(x, y) {
    const state = this.map[y][x];
    const start = state === Maze.Start;
    return start;
  }
  /**
   * 指定座標がゴール位置かどうか判定する
   * @param {number} x 
   * @param {number} y 
   * @return {boolean}
   */
  isGoal(x, y) {
    const state = this.map[y][x];
    const goal = state === Maze.Goal;
    return goal;
  }
  /**
   * ランダムに迷路を作成する
   */
  createRandomMaze() {
    const putWall = (x, y) => {
      this.map[y + 1][x + 1] = Maze.Wall;
    };
    const innerSizeX = this.sizeX - 2;
    const innerSizeY = this.sizeY - 2;
    for (let y = 1; y < innerSizeY; y += 2) {
      for (let x = 1; x < innerSizeX; x += 2) {
        putWall(x, y);
        const direction = Math.floor(Math.random() * 4);
        switch (direction) {
          case 0: putWall(x, y - 1); break;
          case 1: putWall(x + 1, y); break;
          case 2: putWall(x, y + 1); break;
          case 3: putWall(x - 1, y); break;
          default:
            break;
        }
      }
    }
  }
  toString() {
    const rows = [];
    for (let y = 0; y < this.sizeY; y++) {
      const row = [];
      for (let x = 0; x < this.sizeX; x++) {
        const p = this.map[y][x];
        switch (p) {
          case Maze.Aisle: row.push(" "); break;
          case Maze.Wall: row.push("#"); break;
          case Maze.Start: row.push("S"); break;
          case Maze.Goal: row.push("G"); break;
          default: row.push("？"); break;
        }
      }
      rows.push(row.join(''));
    }
    return rows.join('\n');
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
    const maze = new Maze(sizeX, sizeY);
    maze.setStartPosition(0, 1);
    maze.setGoalPosition(-1, -2);
    maze.createRandomMaze();
    console.log(maze.toString());
  }
}
