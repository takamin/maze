import { MazeResolver } from "./maze-resolver.mjs";
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
      return true; // 壁が閉じている(閉鎖空間がある)
    }
    const nextPaths = [...paths, { x, y }];

    const checkWallClosed = (x, y) => {
      if(isLastPos(x, y)) {
        return false;
      }
      if(x < 1 || x >= this.sizeX - 1 || y < 1 || y >= this.sizeY - 1) {
        return false;
      }
      if(!this.isWall(x, y)) {
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
      //
      // 複数の経路が存在する場合、ひとつを残して他の経路の分岐点を閉じる。
      //

      // 迷路を解く奴(複数経路の有無を検査するため)
      const resolver = new MazeResolver(this);
      resolver.reset();
      // 袋小路を壁で塞ぐ(塞いだ場所がなくなるまで)
      while(resolver.buryDeadEnd().length > 0) {
        ;
      }
      try {
        // スタートからゴールまでを順次移動する
        for (;;) {
          resolver.walk(); // 分岐している場合、例外が投入される。
          const { x, y } = resolver.pos;
          if(this.isGoal(x, y)) {
            break; // ゴールに到達(一本道だった)
          }
        }
        return true; // 終了
      } catch(err) {
        console.error(err);
        if(!err.pathToGo) {
          return true;
        } else {
          // 例外に含まれる分岐点の情報を得る
          const branchEntrances = err.pathToGo ?? [];

          // 分岐点の入口をランダムにひとつ選び、他の入口を壁にする
          const iAisle = Math.floor(branchEntrances.length * Math.random());

          // 壁として設定した座標を返す（表示更新のため）
          return branchEntrances.filter((p, i) => {
            if(i !== iAisle) {
              this.setWallAt(p.x, p.y); // 入口を壁にする
              return true;
            }

            return false;
          });
        }
      }
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
