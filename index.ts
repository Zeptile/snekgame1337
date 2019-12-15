// Import stylesheets
import './style.css';

interface Coords {
  x: number;
  y: number;
}

enum Direction {
  Up = 'ArrowUp',
  Down = 'ArrowDown',
  Left = 'ArrowLeft',
  Right = 'ArrowRight',
  Stopped = ''
}

enum EntityType {
  nothing = 0,
  snake = 1,
  pois = 2,
  snakehead = 3
}

const nodeWidth = 15;  // px
const gridSize = 30;   // unit

let direction: string; // Arrows -> [ArrowUp, ArrowDown, ArrowRight, ArrowLeft]
let grid: number[][];
let tailLength = 0;

let tail: Coords[] = [];

let intervalHandle: number;

const gameWindow: HTMLElement = document.querySelector('.game-window');
const resetBtn: HTMLElement = document.querySelector('.reset');
const coordsDebug: HTMLElement = document.querySelector('.coords')

resetBtn.addEventListener('click', startup);
document.addEventListener('keydown', (e) => direction = e.code);

startup();

function startup(): void {
  grid = Array.from(Array(gridSize).fill(0), () => new Array(gridSize).fill(0));
  direction = Direction.Stopped;
  let snake = null;
  tailLength = 0;

  if (intervalHandle) {
    window.clearInterval(intervalHandle);
  }
  
  gameWindow.style.width = `${gridSize * nodeWidth}px`;
  gameWindow.style.height = `${gridSize * nodeWidth}px`;

  drawPois();
  
  const ranCoords = getRandomCoords();
  snake = drawSnake({x: ranCoords.x, y: ranCoords.y}, null);

  intervalHandle = setInterval( () => {
    if(snake) {
      clearSnake();

      switch(direction) {
        case Direction.Up:
          snake = drawSnake({x: snake.x - 1, y: snake.y}, snake);
          break;
        case Direction.Down:
          snake = drawSnake({x: snake.x + 1, y: snake.y}, snake);
          break;
        case Direction.Left:
          snake = drawSnake({x: snake.x, y: snake.y - 1}, snake);
          break;
        case Direction.Right:
          snake = drawSnake({x: snake.x, y: snake.y + 1}, snake);
          break;
      }
    }
  }, 100)
}

function drawSnake(nextSnake: Coords, currentSnake: Coords): Coords {

  if (nextSnake.x > -1 && nextSnake.y > -1 && nextSnake.x < gridSize && nextSnake.y < gridSize) {
    const currentNodeValue = grid[nextSnake.x][nextSnake.y];

    if (currentNodeValue === 1) {
      console.error('YOU HIT YOURSELF IDIOT');
    }

    if (currentNodeValue === 2) {
      tailLength += 1;
      drawPois();
    }

    printCoords(nextSnake.x, nextSnake.y);

    grid[nextSnake.x][nextSnake.y] = 3;

    if (currentSnake) {
      drawSnakeTail(currentSnake);
    }

    drawGrid(grid);

    return nextSnake;
  }
  
  console.error('OUT_OF_BOUNDS');
}

function drawSnakeTail(currPos: Coords) {
  tail.push(currPos);
  for (var z = 0; z < tailLength; z++) {
    let coords = tail[z];
    grid[coords.x][coords.y] = 1;
    drawGrid(grid);
  }

  while (tail.length > tailLength) {
    let coords = tail[0];
    grid[coords.x][coords.y] = 0;
    tail.shift();
  }
}

function clearSnake(): void {
  for (let x = 0; x < gridSize; x++) {
    for (let y = 0; y < gridSize; y++) {
      if (grid[x][y] === 3 || grid[x][y] === 1) {
        grid[x][y] = 0;
      }
    }
  }
}

function drawPois(): void {
  const coords = getRandomCoords();
  grid[coords.x][coords.y] = 2;
  drawGrid(grid);
}

function drawGrid(twoDimensionalArray: number[][]): void {

  gameWindow.removeChild(gameWindow.firstChild); // Reset Grid

  let table = document.createElement('table');
  let tableBody = document.createElement('tbody');

  twoDimensionalArray.forEach((rowData) => {
    let row = document.createElement('tr');

    rowData.forEach((cellData) => {
      let cell = document.createElement('td');

      switch(cellData) {
        case 1:
          cell.className = 'snake';
          break;
        case 2:
          cell.className = 'pois';
          break;
        case 3:
          cell.className = 'snake-head';
          break;
      }

      row.appendChild(cell);
    });

    tableBody.appendChild(row);
  });

  table.appendChild(tableBody);

  gameWindow.appendChild(table);
}

function printCoords(x: number, y: number) {
  if (coordsDebug.firstChild) {
    coordsDebug.removeChild(coordsDebug.firstChild);
  }

  let txt = document.createTextNode(`(${x}, ${y})`);
  coordsDebug.appendChild(txt);
}

function getRandomCoords(): {x: number, y: number} {
  const ranX = getRandomInt(0, gridSize - 1);
  const ranY = getRandomInt(0, gridSize - 1);

  return {x: ranX, y: ranY};
}

function getRandomInt(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

