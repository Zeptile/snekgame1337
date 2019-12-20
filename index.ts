// Import stylesheets
import './style.css';
import * as firebase from 'firebase';


var firebaseConfig = {
  apiKey: "AIzaSyCKlt0LC2CnKA2qnf96uP2Gu2F0uOGQ1SU",
  authDomain: "snekgame1337.firebaseapp.com",
  databaseURL: "https://snekgame1337.firebaseio.com",
  projectId: "snekgame1337",
  storageBucket: "snekgame1337.appspot.com",
  messagingSenderId: "980368520835",
  appId: "1:980368520835:web:90b3ffa4fe9110037f4db6",
  measurementId: "G-9S7FYBZJWQ"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();

var db = firebase.firestore();

interface Coords {
  x: number;
  y: number;
}

interface Player {
  name: string;
  score: number;
}

enum Direction {
  Up = 'ArrowUp',
  Down = 'ArrowDown',
  Left = 'ArrowLeft',
  Right = 'ArrowRight',
  Stopped = ''
}

enum EntityType {
  Nothing = 0,
  Snake = 1,
  Pois = 2,
  Snakehead = 3
}

const nodeWidth = 15;  // px
const gridSize = 30;   // unit

let direction: string; // Arrows -> [ArrowUp, ArrowDown, ArrowRight, ArrowLeft]
let grid: number[][];
let tail: Coords[] = [];
let intervalHandle: number;
let tailLength = 0;
let gameover = false;

const gameWindow: HTMLElement = document.querySelector('.game-window');
const resetBtn: HTMLElement = document.querySelector('.reset');
const coordsDebug: HTMLElement = document.querySelector('.coords');
const scoreElement: HTMLElement = document.querySelector('.score');
const postScoreElement: HTMLElement = document.querySelector('.post-score');
const name: HTMLElement = document.querySelector('.name');
const submitScoreBtn: HTMLElement = document.querySelector('.submit-score');
const tbody: HTMLElement = document.querySelector('.tbody');

resetBtn.addEventListener('click', startup);
submitScoreBtn.addEventListener('click', postScore);

document.addEventListener('keydown', (e) => {
  if (!isOppositeDirection(e.code)) {
    direction = e.code;
  } 
});

startup();
drawLeaderboard();

function startup(): void {
  grid = Array.from(Array(gridSize).fill(0), () => new Array(gridSize).fill(0));
  direction = Direction.Stopped;
  let snake = null;
  tailLength = 0;
  tail = [];
  gameover = false;
  postScoreElement.style.display = 'none';

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
    const nextNodeValue = grid[nextSnake.x][nextSnake.y];

    printCoords({x: nextSnake.x, y: nextSnake.y});

    grid[nextSnake.x][nextSnake.y] = EntityType.Snakehead;

    if (currentSnake) {
      drawSnakeTail(nextSnake);
    }

    if (nextNodeValue === EntityType.Snake) {
      console.error('SELF_HIT');
      gameOver();
    }

    if (nextNodeValue === EntityType.Pois) {
      tailLength += 1;
      drawPois();
    }

    if (!gameover) {
      drawGrid(grid);
    }
    
    if (tail.length > tailLength) {
      let coords = tail[0];
      grid[coords.x][coords.y] = EntityType.Nothing;
      tail.shift();
    }

    return nextSnake;
  }
  
  console.error('OUT_OF_BOUNDS');
  gameOver();
}

function drawSnakeTail(nextPos: Coords) {
  tail.push(nextPos);
  for (var z = 0; z < tailLength; z++) {
    let coords = tail[z];
    grid[coords.x][coords.y] = 1;
  }
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
  let coords = getRandomCoords();
  while (grid[coords.x][coords.y] !== EntityType.Nothing) {
    coords = getRandomCoords();
  }
  grid[coords.x][coords.y] = 2;
  printScore();
  drawGrid(grid);
}

function gameOver(): void {
  gameover = true;
  postScoreElement.style.display = 'block';
  window.clearInterval(intervalHandle);
  gameWindow.removeChild(gameWindow.firstChild);
  let gameoverText = document.createElement('h1');
  gameoverText.className = 'gameover';
  gameoverText.innerText = 'GAME OVER';
  gameWindow.appendChild(gameoverText);
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
        case EntityType.Snake:
          cell.className = 'snake';
          break;
        case EntityType.Pois:
          cell.className = 'pois';
          break;
        case EntityType.Snakehead:
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

function printCoords(coords: Coords) {
  if (coordsDebug.firstChild) {
    coordsDebug.removeChild(coordsDebug.firstChild);
  }

  let txt = document.createTextNode(`(${coords.x}, ${coords.y})`);
  coordsDebug.appendChild(txt);
}

function printScore() {
  if (scoreElement.firstChild) {
    scoreElement.removeChild(scoreElement.firstChild);
  }

  let txt = document.createTextNode(`${tailLength}`);
  scoreElement.appendChild(txt);
}

function getRandomCoords(): Coords {
  const ranX = getRandomInt(0, gridSize - 1);
  const ranY = getRandomInt(0, gridSize - 1);

  return {x: ranX, y: ranY};
}

function drawLeaderboard(): void {

  while (tbody.firstChild) {
    tbody.removeChild(tbody.firstChild);
  }


  db.collection("players").get().then((querySnapshot) => {
    let players: Player[] = [];
    querySnapshot.forEach((doc) => {
      let player = doc.data();
      players.push({
        name: player.name,
        score: player.score,
      });
    });

    players.sort((s1, s2) => (s1.score < s2.score) ? 1 : -1);
    players = players.slice(0, 10);
    let count = 0;

    players.forEach((player) => {
      count++;
      let row = document.createElement('tr');

      let positionCell = document.createElement('td');
      positionCell.innerText = count.toString();
      positionCell.className = 'leaderboard-node';
      row.appendChild(positionCell);
      let nameCell = document.createElement('td');
      nameCell.innerText = player.name
      nameCell.className = 'leaderboard-node';
      row.appendChild(nameCell);
      let scoreCell = document.createElement('td');
      scoreCell.innerText = player.score.toString()
      scoreCell.className = 'leaderboard-node';
      row.appendChild(scoreCell);

      tbody.appendChild(row);
    });
  });
}

function postScore(): void {
  postScoreElement.style.display = 'none';
  db.collection("players").add({
    name: name.value,
    score: tailLength
  }).then((docRef) => {
      console.log("Document written with ID: ", docRef.id);
      drawLeaderboard();
  })
  .catch((error) => {
      console.error("Error adding document: ", error);
      drawLeaderboard();
  });
}

function getRandomInt(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

function isOppositeDirection(nextDirection: string): boolean {
  switch(nextDirection) {
    case Direction.Up:
      return direction === Direction.Down;
    case Direction.Down:
      return direction === Direction.Up;
    case Direction.Left:
      return direction === Direction.Right;
    case Direction.Right:
      return direction === Direction.Left;
  }
}

