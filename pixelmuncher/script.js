const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');

const TILE_SIZE = 30;
const V = 3; // Base Speed unit

const maze = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,3,1],
    [1,0,1,1,0,1,1,1,0,1,1,0,1,1,1,0,1,1,0,1],
    [1,3,1,1,0,1,1,1,0,1,1,0,1,1,1,0,1,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,0,1,0,1,1,1,1,1,1,0,1,0,1,1,0,1],
    [1,0,0,0,0,1,0,0,0,1,1,0,0,0,1,0,0,0,0,1],
    [1,1,1,1,0,1,1,1,2,1,1,2,1,1,1,0,1,1,1,1],
    [2,2,2,1,0,1,2,2,2,9,9,2,2,2,1,0,1,2,2,2],
    [1,1,1,1,0,1,2,1,1,9,9,1,1,2,1,0,1,1,1,1],
    [1,0,0,0,0,0,2,1,9,9,9,9,1,2,0,0,0,0,0,1],
    [1,1,1,1,0,1,2,1,1,1,1,1,1,2,1,0,1,1,1,1],
    [2,2,2,1,0,1,2,2,2,2,2,2,2,2,1,0,1,2,2,2],
    [1,1,1,1,0,1,1,1,0,1,1,0,1,1,1,0,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,0,1,1,1,0,1,1,0,1,1,1,0,1,1,0,1],
    [1,3,0,1,0,0,0,0,0,1,1,0,0,0,0,0,1,0,3,1],
    [1,1,0,1,0,1,0,1,1,1,1,1,1,0,1,0,1,0,1,1],
    [1,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];
let score = 0;
let dotCount = 0;

class Character {
    constructor(x, y, speed, color) {
        this.x = x; this.y = y; this.speed = speed; this.color = color;
        this.dir = { x: 0, y: 0 }; this.nextDir = { x: 0, y: 0 };
    }
    isAtTileCenter() {
        const tileCenterX = (Math.floor(this.x / TILE_SIZE) * TILE_SIZE) + TILE_SIZE / 2;
        const tileCenterY = (Math.floor(this.y / TILE_SIZE) * TILE_SIZE) + TILE_SIZE / 2;
        return Math.abs(this.x - tileCenterX) < this.speed / 2 && Math.abs(this.y - tileCenterY) < this.speed / 2;
    }
    getTile() { return { col: Math.floor(this.x / TILE_SIZE), row: Math.floor(this.y / TILE_SIZE) }; }
    checkCollision(dx, dy) {
        const nextCol = Math.floor((this.x + dx) / TILE_SIZE); const nextRow = Math.floor((this.y + dy) / TILE_SIZE);
        const tile = maze[nextRow]?.[nextCol];
        return tile === 1 || tile === 9;
    }
    move() {
        if (this.x > canvas.width + TILE_SIZE/2) this.x = -TILE_SIZE / 2;
        if (this.x < -TILE_SIZE / 2) this.x = canvas.width + TILE_SIZE/2;
        if (this.isAtTileCenter()) {
            if (this.nextDir.x !== 0 || this.nextDir.y !== 0) {
                 if (!this.checkCollision(this.nextDir.x * TILE_SIZE, this.nextDir.y * TILE_SIZE)) {
                    this.dir.x = this.nextDir.x; this.dir.y = this.nextDir.y;
                    this.nextDir = {x: 0, y: 0};
                }
            }
            if (this.checkCollision(this.dir.x * TILE_SIZE, this.dir.y * TILE_SIZE)) { this.dir.x = 0; this.dir.y = 0; }
        }
        this.x += this.dir.x * this.speed; this.y += this.dir.y * this.speed;
    }
    draw(sizeModifier = 0) {
        ctx.fillStyle = this.color; ctx.beginPath();
        ctx.arc(this.x, this.y, TILE_SIZE / 2 - sizeModifier, 0, Math.PI * 2); ctx.fill();
    }
}

class Player extends Character {
    constructor(x, y) { super(x, y, 0.8 * V, '#ff0'); } // retro-yellow
    eatDot() {
        const { col, row } = this.getTile(); const tile = maze[row]?.[col];
        if (tile === 0 || tile === 3) {
            score += (tile === 0) ? 10 : 50; dotCount--; maze[row][col] = 2;
            scoreEl.textContent = `SCORE: ${score}`;
            if (dotCount === 0) { alert("You Win! Final Score: " + score); document.location.reload(); }
        }
    }
    update() { this.move(); this.eatDot(); }
}

class Ghost extends Character {
    constructor(x, y, color) { super(x, y, 0.75 * V, color); }
    update() {
        if (this.isAtTileCenter()) {
            const choices = []; const opposites = { '1,0': '-1,0', '-1,0': '1,0', '0,1': '0,-1', '0,-1': '0,1' };
            const currentDirKey = `${this.dir.x},${this.dir.y}`;
            const directions = [{x:0, y:-1}, {x:0, y:1}, {x:-1, y:0}, {x:1, y:0}];
            for(const dir of directions) {
                if (`${dir.x},${dir.y}` === opposites[currentDirKey]) continue;
                if (!this.checkCollision(dir.x * TILE_SIZE, dir.y * TILE_SIZE)) choices.push(dir);
            }
            if (choices.length > 0) this.dir = choices[Math.floor(Math.random() * choices.length)];
        }
        this.move();
    }
    draw() {
        ctx.fillStyle = this.color; ctx.beginPath();
        ctx.arc(this.x, this.y, TILE_SIZE / 2, Math.PI, 0);
        ctx.lineTo(this.x + TILE_SIZE / 2, this.y + TILE_SIZE / 2);
        ctx.lineTo(this.x - TILE_SIZE / 2, this.y + TILE_SIZE / 2);
        ctx.closePath(); ctx.fill();
    }
}

let player = new Player(TILE_SIZE * 1.5, TILE_SIZE * 1.5);
let blinky = new Ghost(TILE_SIZE * 10.5, TILE_SIZE * 8.5, '#ff0040'); // retro-red

function init() {
    dotCount = 0;
    maze.forEach(row => row.forEach(tile => { if (tile === 0 || tile === 3) dotCount++; }));
    gameLoop();
}

function drawMaze() {
    for (let row = 0; row < maze.length; row++) {
        for (let col = 0; col < maze[row].length; col++) {
            const tile = maze[row][col], x = col * TILE_SIZE, y = row * TILE_SIZE;
            if (tile === 1) { ctx.fillStyle = '#0080ff'; ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE); } // retro-blue
            else if (tile === 0) { ctx.fillStyle = '#f0f'; ctx.beginPath(); ctx.arc(x + TILE_SIZE / 2, y + TILE_SIZE / 2, 3, 0, Math.PI * 2); ctx.fill(); } // retro-pink
            else if (tile === 3) { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x + TILE_SIZE / 2, y + TILE_SIZE / 2, 7, 0, Math.PI * 2); ctx.fill(); }
        }
    }
}

function checkPlayerGhostCollision() {
    const distance = Math.hypot(player.x - blinky.x, player.y - blinky.y);
    if (distance < TILE_SIZE * 0.8) { alert("Game Over!"); document.location.reload(); }
}

function update() { player.update(); blinky.update(); checkPlayerGhostCollision(); }
function draw() { ctx.clearRect(0, 0, canvas.width, canvas.height); drawMaze(); player.draw(); blinky.draw(); }

function gameLoop() { update(); draw(); requestAnimationFrame(gameLoop); }

window.addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'ArrowUp': case 'w': player.nextDir = { x: 0, y: -1 }; break;
        case 'ArrowDown': case 's': player.nextDir = { x: 0, y: 1 }; break;
        case 'ArrowLeft': case 'a': player.nextDir = { x: -1, y: 0 }; break;
        case 'ArrowRight': case 'd': player.nextDir = { x: 1, y: 0 }; break;
    }
});

init();
