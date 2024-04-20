import { Maze } from './maze.mjs';
import { WebApp } from './webapp.mjs';
const runningInBrowser = (typeof window !== 'undefined');
if (!runningInBrowser && "process" in global && "argv" in process) {
  Maze.run(process.argv.slice(2)).catch(console.err);
} else {
  WebApp.run();
}
