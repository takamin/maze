/**
 * @typedef {import('./maze.mjs').Maze} Maze
 */
/**
 * 迷路を解く探検者
 */
export class MazeResolver {
  /**
   * 迷路
   * @type {Maze}
   */
  maze;
  /**
   * 現在位置
   * @type {{x: number, y: number}}
   */
  pos;
  /**
   * 迷路のスタートからゴールまでの道のり
   * @type {Array<{x: number, y: number}>}
   */
  path;
  /**
   * 迷路の壁と袋小路になった通路を立入禁止にするためのマップ
   * @type {Array<Array<boolean>>}
   */
  walkThroughMap;
  /**
   * コンストラクタ
   * @param {Maze} maze 
   */
  constructor(maze) {
    this.maze = maze;
    this.pos = { x: this.maze.startX, y: this.maze.startY };
    this.path = [];
    this.walkThroughMap = (new Array(maze.sizeY)).fill(null).map(
      () => (new Array(maze.sizeX).fill(true)));
  }
  reset() {
    this.pos = { x: this.maze.startX, y: this.maze.startY };
    this.path = [];
  }
  /**
   * ゴールに向けて一歩進む。
   * @returns {boolean} ゴールに到達したらtrue
   */
  walk() {
    const p = Object.assign({}, this.pos);
    let step = 0;
    if (this.maze.isStart(this.pos.x, this.pos.y)) {
      this.path = [{ ...p }];
      p.x++;
      step++;
    } else {
      const [lastPos] = this.path.slice(-1);
      const north = Object.assign({}, { x: p.x, y: p.y - 1 });
      const west = Object.assign({}, { x: p.x - 1, y: p.y });
      const east = Object.assign({}, { x: p.x + 1, y: p.y });
      const south = Object.assign({}, { x: p.x, y: p.y + 1 });
      const posCanGo = [north, west, east, south].filter(
        (p) => (this.isOnValidPath(p.x, p.y) && this.path.filter((pos) => pos.x === p.x && pos.y === p.y).length === 0));
      if (posCanGo.length === 0) {
        throw new Error('Cannot go anywhere');
      }
      if (posCanGo.length > 1) {
        const err = new Error('Invalid path. The path has a branch');
        err.pathToGo = posCanGo;
        throw err;
      }
      p.x = posCanGo[0].x;
      p.y = posCanGo[0].y;
    }
    this.pos = p;
    this.path.push(p);
    step++;
    return step;
  }
  /**
   * 袋小路を埋める。
   * @returns {Array<{x: number, y:number}} 埋めた袋小路の座標の配列
   */
  buryDeadEnd() {
    let buried = [];
    for (let y = 0; y < this.maze.sizeY; y++) {
      for (let x = 0; x < this.maze.sizeX; x++) {
        // 東西南北それぞれの壁の状況
        const onValidPath = this.isOnValidPath(x, y);
        if (onValidPath) {
          const deadEnd = this.isDeadEnd(x, y);
          // この場所(x,y)が壁、または突き当たりならば通行不可とする。
          if (deadEnd) {
            this.walkThroughMap[y][x] = false;
            buried.push({ x, y }); // 立ち入り禁止区域を設定した
          }
        }
      }
    }
    return buried;
  }
  /**
   * 指定した場所が袋小路になっているかどうかを判定する。
   * @param {number} x 
   * @param {number} y 
   * @returns {boolean}
   */
  isDeadEnd(x, y) {
    // スタート位置とゴールの位置は通行可能なので行き止まりではない
    if (this.maze.isStart(x, y) || this.maze.isGoal(x, y)) {
      return false;
    }
    const countOfInvalid =
      (!this.isOnValidPath(x, y - 1) ? 1 : 0) +
      (!this.isOnValidPath(x - 1, y) ? 1 : 0) +
      (!this.isOnValidPath(x + 1, y) ? 1 : 0) +
      (!this.isOnValidPath(x, y + 1) ? 1 : 0)
    return countOfInvalid >= 3;
  }
  /**
   * 指定した場所がゴールまでの道のりの中に含まれる場所かどうかを判定する。
   * @param {number} x 
   * @param {number} y 
   * @returns {boolean}
   */
  isOnValidPath(x, y) {
    // 範囲外の座標は通行できない。
    if (x < 0 || x >= this.maze.sizeX || y < 0 || y >= this.maze.sizeY) {
      return false;
    }
    // スタート位置とゴールの位置は通行可能
    if (this.maze.isStart(x, y) || this.maze.isGoal(x, y)) {
      return true;
    }
    // 通路であり、かつ立ち入り禁止区域でない場所は通行可能
    return this.maze.isAisle(x, y) && this.walkThroughMap[y][x];
  }
}
