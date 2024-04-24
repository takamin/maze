import { Maze } from "./maze.mjs";

export class MazeNoMaze extends Maze {
  init() {
    for (let y = 0; y < this.sizeY; y++) {
      for (let x = 0; x < this.sizeX; x++) {
        this.setWallAt(x, y);
      }
    }
  }
}
