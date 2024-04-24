import { Maze } from "./maze.mjs";

export class MazeDiggingMethod extends Maze {
  digPos = null;
  /**
   * 穴掘り法で迷路を作成する
   */
  generate() {
    if (!this.digPos) {
      this.digPos = this.getStartPos();
    }
    // 掘る方向の候補
    const directions = this.getDigDirection(this.digPos);
    if (directions.length === 0) {
      // 次に掘り始める場所を決める
      const nextPos = this.getNextDigPos();
      if (!nextPos) { // 次に掘る場所もない
        return true; // 終了
      }
      this.digPos = nextPos;
      return false; // まだ掘る
    }
    const i = Math.floor(Math.random() * directions.length);
    const path = this.getForwardPositions(this.digPos, directions[i]);
    path.forEach(({ x, y }) => this.setAisleAt(x, y));
    this.digPos = path[1];
    return path;
  }
  init() {
    this.digPos = null;
    for (let y = 0; y < this.sizeY; y++) {
      for (let x = 0; x < this.sizeX; x++) {
        this.setWallAt(x, y);
      }
    }
  }
  getStartPos() {
    const startPosToDig = this.getNewDigPos();
    this.setAisleAt(startPosToDig.x, startPosToDig.y);
    return startPosToDig;
  }
  getAllDirections() {
    return [
      { x: 0, y: -1 },
      { x: -1, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
    ];
  }
  getDigDirection(p) {
    return this.getAllDirections().filter(
      (direction) => this.canDigFor(p, direction));
  }
  canDigFor(p, direction) {
    const [
      { x: x1, y: y1 },
      { x: x2, y: y2 },
    ] = this.getForwardPositions(p, direction);
    if (this.isStart(x1, y1) || this.isGoal(x1, y1)) {
      return false;
    }
    if (x2 <= 0 || x2 >= this.sizeX - 1 || y2 <= 0 || y2 >= this.sizeY - 1) {
      return false;
    }
    return this.isWall(x1, y1) && this.isWall(x2, y2);
  }
  digForward(direction) {
    const path = this.getForwardPositions(this.digPos, direction);
    path.forEach(({ x, y }) => this.setAisleAt(x, y));
    return path[1];
  }
  getForwardPositions(p, direction) {
    const x1 = p.x + direction.x;
    const y1 = p.y + direction.y;
    const x2 = p.x + direction.x * 2;
    const y2 = p.y + direction.y * 2;
    return [{ x: x1, y: y1 }, { x: x2, y: y2 }];
  }
  getNewDigPos() {
    const candidates = this.getNewDigPosCandidates();
    const randamIndex = Math.floor(Math.random() * candidates.length);
    return candidates[randamIndex];
  }
  getNextDigPos() {
    const candidates = this.getNewDigPosCandidates()
      .filter(({ x, y }) => (this.isAisle(x, y) && this.getDigDirection({ x, y }).length > 0));

    if (candidates.length === 0) {
      return null;
    }
    const randamIndex = Math.floor(Math.random() * candidates.length);
    return candidates[randamIndex];
  }
  getNewDigPosCandidates() {
    const candidates = [];
    for (let y = 1; y < this.sizeY; y += 2) {
      for (let x = 1; x < this.sizeX; x += 2) {
        if (x % 2 === 1 && y % 2 === 1) {
          candidates.push({ x, y });
        }
      }
    }
    return candidates;
  }
}
