const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// --- RESPONSIVE SETUP ---
const originalWidth = 800;
const originalHeight = 600;
canvas.width = originalWidth;
canvas.height = originalHeight;

// --- GAME VARIABLES ---
// These are now ratios of the canvas size, not fixed pixels
let ballRadius = canvas.width * 0.0125;
let paddleHeight = canvas.width * 0.0125;
let paddleWidth = canvas.width * 0.125;

let x, y, dx, dy, paddleX; // Will be initialized in startGame()
let rightPressed = false;
let leftPressed = false;

// Brick variables
const brickRowCount = 5;
const brickColumnCount = 7;
let brickWidth = canvas.width * 0.1125;
let brickHeight = canvas.height * 0.033;
const brickPadding = canvas.width * 0.0125;
const brickOffsetTop = canvas.height * 0.066;
const brickOffsetLeft = canvas.width * 0.043;

let score = 0;
let lives = 3;

const bricks = [];

function initBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
        bricks[c] = [];
        for (let r = 0; r < brickRowCount; r++) {
            bricks[c][r] = { x: 0, y: 0, status: 1 };
        }
    }
}

function startGame() {
    x = canvas.width / 2;
    y = canvas.height - (paddleHeight + ballRadius + 5);
    dx = canvas.width * 0.005; // Speed scales with width
    dy = -dx; // Keep ball movement proportional
    paddleX = (canvas.width - paddleWidth) / 2;
    score = 0;
    lives = 3;
    initBricks();
}


document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
document.addEventListener("mousemove", mouseMoveHandler, false);
// Touch controls for mobile
document.addEventListener("touchstart", touchMoveHandler, false);
document.addEventListener("touchmove", touchMoveHandler, false);

function touchMoveHandler(e) {
    const touchX = e.touches[0].clientX;
    const rect = canvas.getBoundingClientRect();
    const relativeX = touchX - rect.left;
     if(relativeX > 0 && relativeX < canvas.width) {
        paddleX = relativeX - paddleWidth / 2;
        if (paddleX < 0) paddleX = 0;
        if (paddleX + paddleWidth > canvas.width) paddleX = canvas.width - paddleWidth;
    }
    e.preventDefault(); // Prevent screen scrolling
}


function mouseMoveHandler(e) {
    const rect = canvas.getBoundingClientRect();
    const relativeX = e.clientX - rect.left;
    if(relativeX > 0 && relativeX < canvas.width) {
        paddleX = relativeX - paddleWidth / 2;
        if (paddleX < 0) paddleX = 0;
        if (paddleX + paddleWidth > canvas.width) paddleX = canvas.width - paddleWidth;
    }
}

function keyDownHandler(e) {
    if (e.key == "Right" || e.key == "ArrowRight") rightPressed = true;
    else if (e.key == "Left" || e.key == "ArrowLeft") leftPressed = true;
}

function keyUpHandler(e) {
    if (e.key == "Right" || e.key == "ArrowRight") rightPressed = false;
    else if (e.key == "Left" || e.key == "ArrowLeft") leftPressed = false;
}

function collisionDetection() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            const b = bricks[c][r];
            if (b.status == 1) {
                if (x > b.x && x < b.x + brickWidth && y > b.y && y < b.y + brickHeight) {
                    dy = -dy;
                    b.status = 0;
                    score++;
                    if (score == brickRowCount * brickColumnCount) {
                        alert("YOU WIN, CONGRATULATIONS!");
                        document.location.reload();
                    }
                }
            }
        }
    }
}

function drawBall() {
    ctx.beginPath();
    ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = "#0f0";
    ctx.fill();
    ctx.closePath();
}

function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
    ctx.fillStyle = "#0ff";
    ctx.fill();
    ctx.closePath();
}

function drawBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            if (bricks[c][r].status == 1) {
                const brickX = (c * (brickWidth + brickPadding)) + brickOffsetLeft;
                const brickY = (r * (brickHeight + brickPadding)) + brickOffsetTop;
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;
                ctx.beginPath();
                ctx.rect(brickX, brickY, brickWidth, brickHeight);
                ctx.fillStyle = "#f0f";
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}

function drawScore() {
    ctx.font = `${canvas.width * 0.02}px 'Press Start 2P'`;
    ctx.fillStyle = "#fff";
    ctx.fillText("Score: " + score, 8, canvas.height * 0.04);
}

function drawLives() {
    ctx.font = `${canvas.width * 0.02}px 'Press Start 2P'`;
    ctx.fillStyle = "#fff";
    ctx.fillText("Lives: " + lives, canvas.width - (canvas.width * 0.2), canvas.height * 0.04);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBricks();
    drawBall();
    drawPaddle();
    drawScore();
    drawLives();
    collisionDetection();

    if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) dx = -dx;

    if (y + dy < ballRadius) {
        dy = -dy;
    } else if (y + dy > canvas.height - ballRadius) {
        if (x > paddleX && x < paddleX + paddleWidth) {
            dy = -dy;
        } else {
            lives--;
            if (!lives) {
                alert("GAME OVER");
                document.location.reload();
            } else {
                x = canvas.width / 2;
                y = canvas.height - 30;
                paddleX = (canvas.width - paddleWidth) / 2;
            }
        }
    }

    if (rightPressed && paddleX < canvas.width - paddleWidth) paddleX += 7;
    else if (leftPressed && paddleX > 0) paddleX -= 7;

    x += dx;
    y += dy;

    requestAnimationFrame(draw);
}

// Initialize and start the game
startGame();
draw();
