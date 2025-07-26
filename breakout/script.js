const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
// Get Modal Elements
const gameOverModal = document.getElementById('gameOverModal');
const modalMessage = document.getElementById('modalMessage');
const restartButton = document.getElementById('restartButton');


// --- RESPONSIVE SETUP ---
const originalWidth = 800;
const originalHeight = 600;
canvas.width = originalWidth;
canvas.height = originalHeight;

// --- GAME VARIABLES ---
let ballRadius, paddleHeight, paddleWidth, x, y, dx, dy, paddleX;
let rightPressed = false, leftPressed = false;
let score, lives;
let animationId; // To control the game loop

// Brick variables
const brickRowCount = 5, brickColumnCount = 7;
let brickWidth, brickHeight, brickPadding, brickOffsetTop, brickOffsetLeft;
const bricks = [];

function setResponsiveVars() {
    ballRadius = canvas.width * 0.0125;
    paddleHeight = canvas.width * 0.0125;
    paddleWidth = canvas.width * 0.125;
    brickWidth = canvas.width * 0.1125;
    brickHeight = canvas.height * 0.033;
    brickPadding = canvas.width * 0.0125;
    brickOffsetTop = canvas.height * 0.066;
    brickOffsetLeft = canvas.width * 0.043;
}

function initBricks() {
    bricks.length = 0; // Clear existing bricks
    for (let c = 0; c < brickColumnCount; c++) {
        bricks[c] = [];
        for (let r = 0; r < brickRowCount; r++) {
            bricks[c][r] = { x: 0, y: 0, status: 1 };
        }
    }
}

function resetBallAndPaddle() {
    x = canvas.width / 2;
    y = canvas.height - (paddleHeight + ballRadius + 10);
    dx = canvas.width * 0.005;
    dy = -dx;
    paddleX = (canvas.width - paddleWidth) / 2;
}

function startGame() {
    setResponsiveVars();
    score = 0;
    lives = 3;
    initBricks();
    resetBallAndPaddle();
    draw(); // Start the game loop
}

function showEndScreen(message) {
    cancelAnimationFrame(animationId); // Stop the game
    modalMessage.textContent = message;
    gameOverModal.style.display = 'flex';
}

function restartGame() {
    gameOverModal.style.display = 'none';
    startGame();
}

// --- EVENT LISTENERS ---
restartButton.addEventListener('click', restartGame);
document.addEventListener("keydown", e => {
    if (e.key == "Right" || e.key == "ArrowRight") rightPressed = true;
    else if (e.key == "Left" || e.key == "ArrowLeft") leftPressed = true;
});
document.addEventListener("keyup", e => {
    if (e.key == "Right" || e.key == "ArrowRight") rightPressed = false;
    else if (e.key == "Left" || e.key == "ArrowLeft") leftPressed = false;
});
function movePaddle(clientX) {
    const rect = canvas.getBoundingClientRect();
    const relativeX = clientX - rect.left;
    if(relativeX > 0 && relativeX < canvas.width) {
        paddleX = relativeX - paddleWidth / 2;
        if (paddleX < 0) paddleX = 0;
        if (paddleX + paddleWidth > canvas.width) paddleX = canvas.width - paddleWidth;
    }
}
document.addEventListener("mousemove", e => movePaddle(e.clientX));
document.addEventListener("touchstart", e => { e.preventDefault(); movePaddle(e.touches[0].clientX); }, { passive: false });
document.addEventListener("touchmove", e => { e.preventDefault(); movePaddle(e.touches[0].clientX); }, { passive: false });


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
                        showEndScreen("YOU WIN!"); // Call new function
                    }
                }
            }
        }
    }
}

function drawBall() { ctx.beginPath(); ctx.arc(x, y, ballRadius, 0, Math.PI * 2); ctx.fillStyle = "#0f0"; ctx.fill(); ctx.closePath(); }
function drawPaddle() { ctx.beginPath(); ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight); ctx.fillStyle = "#0ff"; ctx.fill(); ctx.closePath(); }
function drawBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            if (bricks[c][r].status == 1) {
                const brickX = (c * (brickWidth + brickPadding)) + brickOffsetLeft;
                const brickY = (r * (brickHeight + brickPadding)) + brickOffsetTop;
                bricks[c][r].x = brickX; bricks[c][r].y = brickY;
                ctx.beginPath(); ctx.rect(brickX, brickY, brickWidth, brickHeight); ctx.fillStyle = "#f0f"; ctx.fill(); ctx.closePath();
            }
        }
    }
}
function drawScore() { ctx.font = `${canvas.width * 0.02}px 'Press Start 2P'`; ctx.fillStyle = "#fff"; ctx.fillText("Score: " + score, 8, canvas.height * 0.04); }
function drawLives() { ctx.font = `${canvas.width * 0.02}px 'Press Start 2P'`; ctx.fillStyle = "#fff"; ctx.fillText("Lives: " + lives, canvas.width - (canvas.width * 0.2), canvas.height * 0.04); }

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBricks(); drawBall(); drawPaddle(); drawScore(); drawLives();
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
                showEndScreen("GAME OVER"); // Call new function
            } else {
                resetBallAndPaddle();
            }
        }
    }

    if (rightPressed && paddleX < canvas.width - paddleWidth) paddleX += 7;
    else if (leftPressed && paddleX > 0) paddleX -= 7;

    x += dx; y += dy;
    animationId = requestAnimationFrame(draw);
}

// Initialize and start the game
startGame();
