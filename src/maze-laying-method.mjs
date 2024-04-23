import { Maze } from "./maze.mjs";

export class MazeLayingMethod extends Maze {
  /**
   * ランダムに迷路を作成する
   */
  createRandomMaze() {
    const isWallAt = (x, y) => {
      const xx = x + 1;
      const yy = y + 1;
      if (xx < 0 || xx >= this.sizeX || yy < 0 || yy >= this.sizeY) {
        return true;
      }
      return this.map[yy][xx] === Maze.Wall;
    };
    const putWall = (x, y) => {
      this.map[y + 1][x + 1] = Maze.Wall;
    };
    const innerSizeX = this.sizeX - 2;
    const innerSizeY = this.sizeY - 2;
    for (let y = 1; y < innerSizeY; y += 2) {
      for (let x = 1; x < innerSizeX; x += 2) {
        putWall(x, y);
        const direction = {
          top: { x: x, y: y - 1 },
          left: { x: x - 1, y: y },
          right: { x: x + 1, y: y },
          bottom: { x: x, y: y + 1 },
        }
        if (y > 1 || isWallAt(x, y - 1)) {
          delete direction.top;
        }
        if (x > 1 || isWallAt(x - 1, y)) {
          delete direction.left;
        }
        const dirCount = Object.keys(direction).length;
        const dirCoord = Object.values(direction);
        const dirIndex = Math.floor(Math.random() * dirCount);
        const { x: wallX, y: wallY } = dirCoord[dirIndex];
        putWall(wallX, wallY);
      }
    }
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
    maze.createRandomMaze();
    console.log(maze.toString());
  }
}
