const statusDisplay = document.querySelector('.game-status');
const cells = document.querySelectorAll('.cell');
const restartButton = document.querySelector('.game-restart');
// Get Modal Elements
const gameOverModal = document.getElementById('gameOverModal');
const modalMessage = document.getElementById('modalMessage');

let gameActive = true;
let currentPlayer = "X";
let gameState = ["", "", "", "", "", "", "", "", ""];

const winningMessage = () => `Player ${currentPlayer} has won!`;
const drawMessage = () => `Game ended in a draw!`;
const currentPlayerTurn = () => `It's ${currentPlayer}'s turn`;

statusDisplay.innerHTML = currentPlayerTurn();

const winningConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
];

function handleCellPlayed(clickedCell, clickedCellIndex) {
    gameState[clickedCellIndex] = currentPlayer;
    clickedCell.innerHTML = currentPlayer;
    if (currentPlayer === "X") clickedCell.style.color = "#0ff";
    else clickedCell.style.color = "#f0f";
}

function handlePlayerChange() {
    currentPlayer = currentPlayer === "X" ? "O" : "X";
    statusDisplay.innerHTML = currentPlayerTurn();
}

function showEndScreen(message) {
    gameActive = false;
    modalMessage.textContent = message;
    gameOverModal.style.display = 'flex';
}

function handleResultValidation() {
    let roundWon = false;
    for (let i = 0; i < winningConditions.length; i++) {
        const winCondition = winningConditions[i];
        let a = gameState[winCondition[0]], b = gameState[winCondition[1]], c = gameState[winCondition[2]];
        if (a === '' || b === '' || c === '') continue;
        if (a === b && b === c) { roundWon = true; break; }
    }

    if (roundWon) {
        showEndScreen(winningMessage());
        return;
    }

    let roundDraw = !gameState.includes("");
    if (roundDraw) {
        showEndScreen(drawMessage());
        return;
    }

    handlePlayerChange();
}

function handleCellClick(e) {
    const clickedCell = e.target;
    const clickedCellIndex = parseInt(clickedCell.getAttribute('data-cell-index'));
    if (gameState[clickedCellIndex] !== "" || !gameActive) return;
    handleCellPlayed(clickedCell, clickedCellIndex);
    handleResultValidation();
}

function handleRestartGame() {
    gameActive = true;
    currentPlayer = "X";
    gameState = ["", "", "", "", "", "", "", "", ""];
    statusDisplay.innerHTML = currentPlayerTurn();
    cells.forEach(cell => { cell.innerHTML = ""; cell.style.color = "#fff"; });
    gameOverModal.style.display = 'none'; // Hide the modal
}

cells.forEach(cell => cell.addEventListener('click', handleCellClick));
restartButton.addEventListener('click', handleRestartGame);
