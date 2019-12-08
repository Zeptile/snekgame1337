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
  snake = drawSnake(ranCoords.x, ranCoords.y);

  intervalHandle = setInterval( () => {
    if(snake) {
      clearSnake();

      //console.log(snake);

      switch(direction) {
        case Direction.Up:
          snake = drawSnake(snake.x - 1, snake.y);
          break;
        case Direction.Down:
          snake = drawSnake(snake.x + 1, snake.y);
          break;
        case Direction.Left:
          snake = drawSnake(snake.x, snake.y - 1);
          break;
        case Direction.Right:
          snake = drawSnake(snake.x, snake.y + 1);
          break;
      }
    }
  }, 100)
}

function drawSnake(x: number, y: number): {x: number, y: number}  {

  if (x > -1 && y > -1 && x < gridSize && y < gridSize) {
    const currentNodeValue = grid[x][y];

    if (currentNodeValue === 1) {
      console.error('YOU HIT YOURSELF IDIOT');
    }

    if (currentNodeValue === 2) {
      tailLength += 1;
      drawPois();
    }

    if (tailLength > 0) {
      for (let i = 0; i < tailLength; i++) {
        switch (direction) {
          case Direction.Up:
            grid[x + i][y] = 1;
            break;
          case Direction.Down:
            grid[x - i][y] = 1;
            break;
          case Direction.Left:
            grid[x][y + i] = 1;
            break;
          case Direction.Right:
            grid[x][y - i] = 1;
            break;
        }
      }
    }

    printCoords(x, y);

    grid[x][y] = 3;

    drawGrid(grid);

    return {x: x, y: y};
  }
  
  console.error('OUT_OF_BOUNDS');
}

function clearSnake(): void {
  for (let x = 0; x < gridSize; x++) {
    for (let y = 0; y < gridSize; y++) {
      if (grid[x][y] === 3) {
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

