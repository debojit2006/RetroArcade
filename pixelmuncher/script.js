const container = document.getElementById('game-container');
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');

// --- RESPONSIVE SETUP ---
const maze = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[1,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,3,1],[1,0,1,1,0,1,1,1,0,1,1,0,1,1,1,0,1,1,0,1],[1,3,1,1,0,1,1,1,0,1,1,0,1,1,1,0,1,1,0,1],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,0,1,1,0,1,0,1,1,1,1,1,1,0,1,0,1,1,0,1],[1,0,0,0,0,1,0,0,0,1,1,0,0,0,1,0,0,0,0,1],[1,1,1,1,0,1,1,1,2,1,1,2,1,1,1,0,1,1,1,1],[2,2,2,1,0,1,2,2,2,9,9,2,2,2,1,0,1,2,2,2],[1,1,1,1,0,1,2,1,1,9,9,1,1,2,1,0,1,1,1,1],[1,0,0,0,0,0,2,1,9,9,9,9,1,2,0,0,0,0,0,1],[1,1,1,1,0,1,2,1,1,1,1,1,1,2,1,0,1,1,1,1],[2,2,2,1,0,1,2,2,2,2,2,2,2,2,1,0,1,2,2,2],[1,1,1,1,0,1,1,1,0,1,1,0,1,1,1,0,1,1,1,1],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,0,1,1,0,1,1,1,0,1,1,0,1,1,1,0,1,1,0,1],[1,3,0,1,0,0,0,0,0,1,1,0,0,0,0,0,1,0,3,1],[1,1,0,1,0,1,0,1,1,1,1,1,1,0,1,0,1,0,1,1],[1,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0,1],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];
const MAZE_COLS = maze[0].length;
const MAZE_ROWS = maze.length;
let TILE_SIZE;
let V; // Speed

let player, blinky;
let score = 0;
let dotCount = 0;

function resizeCanvas() {
    const size = Math.min(container.clientWidth, container.clientHeight);
    canvas.width = size;
    canvas.height = size;
    TILE_SIZE = canvas.width / MAZE_COLS;
    V = TILE_SIZE / 8; // Scale speed with tile size
}


class Character {
    constructor(col, row, speed, color) {
        this.x = col * TILE_SIZE + TILE_SIZE / 2;
        this.y = row * TILE_SIZE + TILE_SIZE / 2;
        this.speed = speed; this.color = color;
        this.dir = { x: 0, y: 0 }; this.nextDir = { x: 0, y: 0 };
    }
    isAtTileCenter() {
        const tileCenterX = Math.floor(this.x / TILE_SIZE) * TILE_SIZE + TILE_SIZE / 2;
        const tileCenterY = Math.floor(this.y / TILE_SIZE) * TILE_SIZE + TILE_SIZE / 2;
        return Math.abs(this.x - tileCenterX) < this.speed / 2 && Math.abs(this.y - tileCenterY) < this.speed / 2;
    }
    getTile() { return { col: Math.floor(this.x / TILE_SIZE), row: Math.floor(this.y / TILE_SIZE) }; }
    checkCollision(dx, dy) {
        const { col, row } = this.getTile();
        const nextCol = col + dx;
        const nextRow = row + dy;
        const tile = maze[nextRow]?.[nextCol];
        return tile === 1 || tile === 9;
    }
    move() {
        if (this.x > canvas.width + TILE_SIZE/2) this.x = -TILE_SIZE / 2;
        if (this.x < -TILE_SIZE / 2) this.x = canvas.width + TILE_SIZE/2;
        if (this.isAtTileCenter()) {
            if (this.nextDir.x !== 0 || this.nextDir.y !== 0) {
                 if (!this.checkCollision(this.nextDir.x, this.nextDir.y)) {
                    this.dir = { ...this.nextDir };
                    this.nextDir = {x: 0, y: 0};
                }
            }
            if (this.checkCollision(this.dir.x, this.dir.y)) { this.dir = {x: 0, y: 0}; }
        }
        this.x += this.dir.x * this.speed; this.y += this.dir.y * this.speed;
    }
    draw(sizeModifier = 0) {
        ctx.fillStyle = this.color; ctx.beginPath();
        ctx.arc(this.x, this.y, TILE_SIZE / 2 - sizeModifier, 0, Math.PI * 2); ctx.fill();
    }
}

class Player extends Character {
    constructor(col, row) { super(col, row, 0.8 * V, '#ff0'); } // retro-yellow
    eatDot() {
        const { col, row } = this.getTile(); const tile = maze[row]?.[col];
        if (tile === 0 || tile === 3) {
            score += (tile === 0) ? 10 : 50; dotCount--; maze[row][col] = 2;
            scoreEl.textContent = `SCORE: ${score}`;
            if (dotCount === 0) { alert("You Win!"); document.location.reload(); }
        }
    }
    update() { this.move(); this.eatDot(); }
}

class Ghost extends Character {
    constructor(col, row, color) { super(col, row, 0.75 * V, color); }
    update() {
        if (this.isAtTileCenter()) {
            const choices = []; const opposites = { '1,0': '-1,0', '-1,0': '1,0', '0,1': '0,-1', '0,-1': '0,1' };
            const currentDirKey = `${this.dir.x},${this.dir.y}`;
            const directions = [{x:0, y:-1}, {x:0, y:1}, {x:-1, y:0}, {x:1, y:0}];
            for(const dir of directions) {
                if (`${dir.x},${dir.y}` === opposites[currentDirKey]) continue;
                if (!this.checkCollision(dir.x, dir.y)) choices.push(dir);
            }
            if (choices.length > 0) this.dir = choices[Math.floor(Math.random() * choices.length)];
        }
        this.move();
    }
    draw() {
        ctx.fillStyle = this.color; ctx.beginPath();
        const bodySize = TILE_SIZE / 2;
        ctx.arc(this.x, this.y, bodySize, Math.PI, 0);
        ctx.lineTo(this.x + bodySize, this.y + bodySize);
        ctx.lineTo(this.x - bodySize, this.y + bodySize);
        ctx.closePath(); ctx.fill();
    }
}

function init() {
    resizeCanvas();
    dotCount = 0;
    maze.forEach(row => row.forEach(tile => { if (tile === 0 || tile === 3) dotCount++; }));
    player = new Player(1.0, 1.0);
    blinky = new Ghost(10.0, 8.0, '#ff0040'); // retro-red
    gameLoop();
}

function drawMaze() {
    for (let row = 0; row < MAZE_ROWS; row++) {
        for (let col = 0; col < MAZE_COLS; col++) {
            const tile = maze[row][col], x = col * TILE_SIZE, y = row * TILE_SIZE;
            if (tile === 1) { ctx.fillStyle = '#0080ff'; ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE); } // retro-blue
            else if (tile === 0) { ctx.fillStyle = '#f0f'; ctx.beginPath(); ctx.arc(x + TILE_SIZE / 2, y + TILE_SIZE / 2, TILE_SIZE * 0.1, 0, Math.PI * 2); ctx.fill(); } // retro-pink
            else if (tile === 3) { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x + TILE_SIZE / 2, y + TILE_SIZE / 2, TILE_SIZE * 0.25, 0, Math.PI * 2); ctx.fill(); }
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

window.addEventListener('resize', init);
window.addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'ArrowUp': case 'w': player.nextDir = { x: 0, y: -1 }; break;
        case 'ArrowDown': case 's': player.nextDir = { x: 0, y: 1 }; break;
        case 'ArrowLeft': case 'a': player.nextDir = { x: -1, y: 0 }; break;
        case 'ArrowRight': case 'd': player.nextDir = { x: 1, y: 0 }; break;
    }
});

// --- Touch Controls for Mobile ---
let touchStartX = 0;
let touchStartY = 0;
canvas.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    e.preventDefault();
}, { passive: false });

canvas.addEventListener('touchend', (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    handleSwipe(touchEndX - touchStartX, touchEndY - touchStartY);
    e.preventDefault();
}, { passive: false });


function handleSwipe(deltaX, deltaY) {
    if (Math.abs(deltaX) > Math.abs(deltaY)) { // Horizontal swipe
        if (deltaX > 0) player.nextDir = { x: 1, y: 0 }; // Right
        else player.nextDir = { x: -1, y: 0 }; // Left
    } else { // Vertical swipe
        if (deltaY > 0) player.nextDir = { x: 0, y: 1 }; // Down
        else player.nextDir = { x: 0, y: -1 }; // Up
    }
}

init();
