// --- ELEMENT SELECTORS ---
// Get the display element for game status messages.
const statusDisplay = document.querySelector('.game-status');
// Get all the grid cells.
const cells = document.querySelectorAll('.cell');
// Get the restart button.
const restartButton = document.querySelector('.game-restart');

// --- GAME STATE VARIABLES ---
// Boolean to track if the game is currently active.
let gameActive = true;
// String to hold the current player ('X' or 'O').
let currentPlayer = "X";
// Array to represent the game board. Empty strings mean the cell is empty.
let gameState = ["", "", "", "", "", "", "", "", ""];

// --- MESSAGES ---
// Function to generate the winning message.
const winningMessage = () => `Player ${currentPlayer} has won!`;
// Function to generate the draw message.
const drawMessage = () => `Game ended in a draw!`;
// Function to generate the current player's turn message.
const currentPlayerTurn = () => `It's ${currentPlayer}'s turn`;

// --- INITIALIZE GAME ---
// Set the initial status message.
statusDisplay.innerHTML = currentPlayerTurn();

// --- WINNING CONDITIONS ---
// An array of arrays, where each inner array represents a winning line.
const winningConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6]             // Diagonals
];

// --- FUNCTIONS ---

/**
 * Updates the game state and the UI for a played cell.
 * @param {HTMLElement} clickedCell - The cell element that was clicked.
 * @param {number} clickedCellIndex - The index of the clicked cell.
 */
function handleCellPlayed(clickedCell, clickedCellIndex) {
    // Update the internal game state array.
    gameState[clickedCellIndex] = currentPlayer;
    // Update the cell's text on the screen.
    clickedCell.innerHTML = currentPlayer;
    // Apply retro colors based on the player.
    if (currentPlayer === "X") {
        clickedCell.style.color = "#0ff"; // retro-cyan
    } else {
        clickedCell.style.color = "#f0f"; // retro-pink
    }
}

/**
 * Switches the current player from 'X' to 'O' or vice-versa.
 */
function handlePlayerChange() {
    currentPlayer = currentPlayer === "X" ? "O" : "X";
    statusDisplay.innerHTML = currentPlayerTurn();
}

/**
 * Checks if the game has been won, drawn, or should continue.
 */
function handleResultValidation() {
    let roundWon = false;
    // Loop through all winning conditions.
    for (let i = 0; i < winningConditions.length; i++) {
        const winCondition = winningConditions[i];
        let a = gameState[winCondition[0]];
        let b = gameState[winCondition[1]];
        let c = gameState[winCondition[2]];
        // If any cell in the condition is empty, it's not a win.
        if (a === '' || b === '' || c === '') {
            continue;
        }
        // If all three cells are the same, we have a winner.
        if (a === b && b === c) {
            roundWon = true;
            break;
        }
    }

    if (roundWon) {
        statusDisplay.innerHTML = winningMessage();
        gameActive = false;
        return;
    }

    // Check for a draw (if no empty cells are left).
    let roundDraw = !gameState.includes("");
    if (roundDraw) {
        statusDisplay.innerHTML = drawMessage();
        gameActive = false;
        return;
    }

    // If no one has won and it's not a draw, change the player.
    handlePlayerChange();
}

/**
 * Handles a click on a cell.
 * @param {Event} e - The click event.
 */
function handleCellClick(e) {
    const clickedCell = e.target;
    const clickedCellIndex = parseInt(clickedCell.getAttribute('data-cell-index'));

    // Ignore the click if the cell is already played or the game is over.
    if (gameState[clickedCellIndex] !== "" || !gameActive) {
        return;
    }

    // Process the move.
    handleCellPlayed(clickedCell, clickedCellIndex);
    handleResultValidation();
}

/**
 * Resets the game to its initial state.
 */
function handleRestartGame() {
    gameActive = true;
    currentPlayer = "X";
    gameState = ["", "", "", "", "", "", "", "", ""];
    statusDisplay.innerHTML = currentPlayerTurn();
    // Clear the text and color from all cells.
    cells.forEach(cell => {
        cell.innerHTML = "";
        cell.style.color = "#fff";
    });
}

// --- EVENT LISTENERS ---
// Add a click listener to every cell.
cells.forEach(cell => cell.addEventListener('click', handleCellClick));
// Add a click listener to the restart button.
restartButton.addEventListener('click', handleRestartGame);
