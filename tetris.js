// Tetris Game
let tetrisCanvas, tetrisCtx, nextCanvas, nextCtx;
let tetrisBoard = [];
let currentPiece = null;
let nextPiece = null;
let tetrisScore = 0;
let tetrisLevel = 1;
let tetrisLines = 0;
let tetrisGameOver = false;
let tetrisInterval = null;
let tetrisDropSpeed = 1000;

const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30;
const NEXT_BLOCK_SIZE = 20;

const COLORS = [
    null,
    '#00f0f0', // I - cyan
    '#0000f0', // J - blue
    '#f0a000', // L - orange
    '#f0f000', // O - yellow
    '#00f000', // S - green
    '#a000f0', // T - purple
    '#f00000'  // Z - red
];

const PIECES = [
    // I
    [
        [[0,0,0,0], [1,1,1,1], [0,0,0,0], [0,0,0,0]],
        [[0,0,1,0], [0,0,1,0], [0,0,1,0], [0,0,1,0]],
        [[0,0,0,0], [0,0,0,0], [1,1,1,1], [0,0,0,0]],
        [[0,1,0,0], [0,1,0,0], [0,1,0,0], [0,1,0,0]]
    ],
    // J
    [
        [[2,0,0], [2,2,2], [0,0,0]],
        [[0,2,2], [0,2,0], [0,2,0]],
        [[0,0,0], [2,2,2], [0,0,2]],
        [[0,2,0], [0,2,0], [2,2,0]]
    ],
    // L
    [
        [[0,0,3], [3,3,3], [0,0,0]],
        [[0,3,0], [0,3,0], [0,3,3]],
        [[0,0,0], [3,3,3], [3,0,0]],
        [[3,3,0], [0,3,0], [0,3,0]]
    ],
    // O
    [
        [[4,4], [4,4]],
        [[4,4], [4,4]],
        [[4,4], [4,4]],
        [[4,4], [4,4]]
    ],
    // S
    [
        [[0,5,5], [5,5,0], [0,0,0]],
        [[0,5,0], [0,5,5], [0,0,5]],
        [[0,0,0], [0,5,5], [5,5,0]],
        [[5,0,0], [5,5,0], [0,5,0]]
    ],
    // T
    [
        [[0,6,0], [6,6,6], [0,0,0]],
        [[0,6,0], [0,6,6], [0,6,0]],
        [[0,0,0], [6,6,6], [0,6,0]],
        [[0,6,0], [6,6,0], [0,6,0]]
    ],
    // Z
    [
        [[7,7,0], [0,7,7], [0,0,0]],
        [[0,0,7], [0,7,7], [0,7,0]],
        [[0,0,0], [7,7,0], [0,7,7]],
        [[0,7,0], [7,7,0], [7,0,0]]
    ]
];

class Piece {
    constructor(type) {
        this.type = type;
        this.rotation = 0;
        this.shape = PIECES[type][0];
        this.x = Math.floor(COLS / 2) - Math.ceil(this.shape[0].length / 2);
        this.y = 0;
    }

    rotate() {
        this.rotation = (this.rotation + 1) % 4;
        this.shape = PIECES[this.type][this.rotation];
    }

    rotateBack() {
        this.rotation = (this.rotation + 3) % 4;
        this.shape = PIECES[this.type][this.rotation];
    }
}

function initTetris() {
    tetrisCanvas = document.getElementById('game-canvas');
    tetrisCtx = tetrisCanvas.getContext('2d');
    nextCanvas = document.getElementById('next-canvas');
    nextCtx = nextCanvas.getContext('2d');

    // Initialize board
    tetrisBoard = [];
    for (let r = 0; r < ROWS; r++) {
        tetrisBoard[r] = [];
        for (let c = 0; c < COLS; c++) {
            tetrisBoard[r][c] = 0;
        }
    }

    tetrisScore = 0;
    tetrisLevel = 1;
    tetrisLines = 0;
    tetrisGameOver = false;
    tetrisDropSpeed = 1000;

    updateTetrisScore();

    currentPiece = new Piece(Math.floor(Math.random() * 7));
    nextPiece = new Piece(Math.floor(Math.random() * 7));

    document.addEventListener('keydown', tetrisKeyHandler);

    drawTetris();
    drawNextPiece();

    tetrisInterval = setInterval(tetrisGameLoop, tetrisDropSpeed);
}

function stopTetris() {
    if (tetrisInterval) {
        clearInterval(tetrisInterval);
        tetrisInterval = null;
    }
    document.removeEventListener('keydown', tetrisKeyHandler);
}

function tetrisKeyHandler(e) {
    if (tetrisGameOver) return;

    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space', ' '].includes(e.key)) {
        e.preventDefault();
    }

    switch (e.key) {
        case 'ArrowLeft':
            movePiece(-1, 0);
            break;
        case 'ArrowRight':
            movePiece(1, 0);
            break;
        case 'ArrowDown':
            movePiece(0, 1);
            break;
        case 'ArrowUp':
            rotatePiece();
            break;
        case ' ':
        case 'Space':
            hardDrop();
            break;
    }
    drawTetris();
}

function movePiece(dx, dy) {
    currentPiece.x += dx;
    currentPiece.y += dy;

    if (collision()) {
        currentPiece.x -= dx;
        currentPiece.y -= dy;
        return false;
    }
    return true;
}

function rotatePiece() {
    currentPiece.rotate();
    if (collision()) {
        currentPiece.rotateBack();
    }
}

function hardDrop() {
    while (movePiece(0, 1)) {}
    lockPiece();
}

function collision() {
    const shape = currentPiece.shape;
    for (let r = 0; r < shape.length; r++) {
        for (let c = 0; c < shape[r].length; c++) {
            if (shape[r][c]) {
                const newX = currentPiece.x + c;
                const newY = currentPiece.y + r;

                if (newX < 0 || newX >= COLS || newY >= ROWS) {
                    return true;
                }

                if (newY >= 0 && tetrisBoard[newY][newX]) {
                    return true;
                }
            }
        }
    }
    return false;
}

function lockPiece() {
    const shape = currentPiece.shape;
    for (let r = 0; r < shape.length; r++) {
        for (let c = 0; c < shape[r].length; c++) {
            if (shape[r][c]) {
                const boardY = currentPiece.y + r;
                const boardX = currentPiece.x + c;

                if (boardY < 0) {
                    tetrisGameOver = true;
                    gameOverTetris();
                    return;
                }

                tetrisBoard[boardY][boardX] = shape[r][c];
            }
        }
    }

    clearLines();
    spawnNewPiece();
}

function clearLines() {
    let linesCleared = 0;

    for (let r = ROWS - 1; r >= 0; r--) {
        let full = true;
        for (let c = 0; c < COLS; c++) {
            if (!tetrisBoard[r][c]) {
                full = false;
                break;
            }
        }

        if (full) {
            linesCleared++;
            // Remove the line
            for (let y = r; y > 0; y--) {
                for (let c = 0; c < COLS; c++) {
                    tetrisBoard[y][c] = tetrisBoard[y - 1][c];
                }
            }
            // Clear top line
            for (let c = 0; c < COLS; c++) {
                tetrisBoard[0][c] = 0;
            }
            r++; // Check same row again
        }
    }

    if (linesCleared > 0) {
        const points = [0, 100, 300, 500, 800];
        tetrisScore += points[linesCleared] * tetrisLevel;
        tetrisLines += linesCleared;

        // Level up every 10 lines
        const newLevel = Math.floor(tetrisLines / 10) + 1;
        if (newLevel > tetrisLevel) {
            tetrisLevel = newLevel;
            tetrisDropSpeed = Math.max(100, 1000 - (tetrisLevel - 1) * 100);
            clearInterval(tetrisInterval);
            tetrisInterval = setInterval(tetrisGameLoop, tetrisDropSpeed);
        }

        updateTetrisScore();
    }
}

function spawnNewPiece() {
    currentPiece = nextPiece;
    nextPiece = new Piece(Math.floor(Math.random() * 7));

    if (collision()) {
        tetrisGameOver = true;
        gameOverTetris();
    }

    drawNextPiece();
}

function tetrisGameLoop() {
    if (tetrisGameOver) return;

    if (!movePiece(0, 1)) {
        lockPiece();
    }
    drawTetris();
}

function drawTetris() {
    // Clear canvas
    tetrisCtx.fillStyle = '#000';
    tetrisCtx.fillRect(0, 0, tetrisCanvas.width, tetrisCanvas.height);

    // Draw grid
    tetrisCtx.strokeStyle = '#222';
    for (let r = 0; r <= ROWS; r++) {
        tetrisCtx.beginPath();
        tetrisCtx.moveTo(0, r * BLOCK_SIZE);
        tetrisCtx.lineTo(COLS * BLOCK_SIZE, r * BLOCK_SIZE);
        tetrisCtx.stroke();
    }
    for (let c = 0; c <= COLS; c++) {
        tetrisCtx.beginPath();
        tetrisCtx.moveTo(c * BLOCK_SIZE, 0);
        tetrisCtx.lineTo(c * BLOCK_SIZE, ROWS * BLOCK_SIZE);
        tetrisCtx.stroke();
    }

    // Draw board
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            if (tetrisBoard[r][c]) {
                drawBlock(tetrisCtx, c, r, COLORS[tetrisBoard[r][c]], BLOCK_SIZE);
            }
        }
    }

    // Draw current piece
    if (currentPiece) {
        const shape = currentPiece.shape;
        for (let r = 0; r < shape.length; r++) {
            for (let c = 0; c < shape[r].length; c++) {
                if (shape[r][c]) {
                    drawBlock(tetrisCtx, currentPiece.x + c, currentPiece.y + r, COLORS[shape[r][c]], BLOCK_SIZE);
                }
            }
        }
    }
}

function drawBlock(ctx, x, y, color, size) {
    ctx.fillStyle = color;
    ctx.fillRect(x * size + 1, y * size + 1, size - 2, size - 2);

    // Highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillRect(x * size + 1, y * size + 1, size - 2, 4);
    ctx.fillRect(x * size + 1, y * size + 1, 4, size - 2);

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(x * size + size - 5, y * size + 1, 4, size - 2);
    ctx.fillRect(x * size + 1, y * size + size - 5, size - 2, 4);
}

function drawNextPiece() {
    nextCtx.fillStyle = '#000';
    nextCtx.fillRect(0, 0, nextCanvas.width, nextCanvas.height);

    if (nextPiece) {
        const shape = nextPiece.shape;
        const offsetX = (nextCanvas.width - shape[0].length * NEXT_BLOCK_SIZE) / 2 / NEXT_BLOCK_SIZE;
        const offsetY = (nextCanvas.height - shape.length * NEXT_BLOCK_SIZE) / 2 / NEXT_BLOCK_SIZE;

        for (let r = 0; r < shape.length; r++) {
            for (let c = 0; c < shape[r].length; c++) {
                if (shape[r][c]) {
                    drawBlockNext(nextCtx, offsetX + c, offsetY + r, COLORS[shape[r][c]]);
                }
            }
        }
    }
}

function drawBlockNext(ctx, x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * NEXT_BLOCK_SIZE + 1, y * NEXT_BLOCK_SIZE + 1, NEXT_BLOCK_SIZE - 2, NEXT_BLOCK_SIZE - 2);
}

function updateTetrisScore() {
    document.getElementById('score').textContent = tetrisScore;
    document.getElementById('level').textContent = tetrisLevel;
    document.getElementById('lines').textContent = tetrisLines;
}

function gameOverTetris() {
    clearInterval(tetrisInterval);
    tetrisCtx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    tetrisCtx.fillRect(0, 0, tetrisCanvas.width, tetrisCanvas.height);

    tetrisCtx.fillStyle = '#fff';
    tetrisCtx.font = 'bold 30px Arial';
    tetrisCtx.textAlign = 'center';
    tetrisCtx.fillText('游戏结束!', tetrisCanvas.width / 2, tetrisCanvas.height / 2 - 20);
    tetrisCtx.font = '20px Arial';
    tetrisCtx.fillText('分数: ' + tetrisScore, tetrisCanvas.width / 2, tetrisCanvas.height / 2 + 20);
}
