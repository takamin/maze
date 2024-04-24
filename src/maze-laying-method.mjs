import { Maze } from "./maze.mjs";

export class MazeLayingMethod extends Maze {
  init() {

  }
  /**
   * ランダムに迷路を作成する
   */
  generate() {
    for (let y = 2; y < this.sizeY; y += 2) {
      for (let x = 2; x < this.sizeX; x += 2) {
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
      }
    }
    return true;
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
