// Snake Game
let snakeCanvas, snakeCtx;
let snake = [];
let food = {};
let snakeDirection = 'right';
let snakeNextDirection = 'right';
let snakeScore = 0;
let snakeHighScore = 0;
let snakeGameOver = false;
let snakeInterval = null;
let snakeSpeed = 150;

const SNAKE_GRID_SIZE = 20;
const SNAKE_COLS = 20;
const SNAKE_ROWS = 20;

function initSnake() {
    snakeCanvas = document.getElementById('game-canvas');
    snakeCtx = snakeCanvas.getContext('2d');

    // Load high score from localStorage
    snakeHighScore = parseInt(localStorage.getItem('snakeHighScore')) || 0;

    // Initialize snake
    snake = [
        { x: 5, y: 10 },
        { x: 4, y: 10 },
        { x: 3, y: 10 }
    ];

    snakeDirection = 'right';
    snakeNextDirection = 'right';
    snakeScore = 0;
    snakeGameOver = false;

    updateSnakeScore();
    spawnFood();

    document.addEventListener('keydown', snakeKeyHandler);

    drawSnake();

    snakeInterval = setInterval(snakeGameLoop, snakeSpeed);
}

function stopSnake() {
    if (snakeInterval) {
        clearInterval(snakeInterval);
        snakeInterval = null;
    }
    document.removeEventListener('keydown', snakeKeyHandler);
}

function snakeKeyHandler(e) {
    if (snakeGameOver) return;

    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        e.preventDefault();
    }

    switch (e.key) {
        case 'ArrowUp':
            if (snakeDirection !== 'down') snakeNextDirection = 'up';
            break;
        case 'ArrowDown':
            if (snakeDirection !== 'up') snakeNextDirection = 'down';
            break;
        case 'ArrowLeft':
            if (snakeDirection !== 'right') snakeNextDirection = 'left';
            break;
        case 'ArrowRight':
            if (snakeDirection !== 'left') snakeNextDirection = 'right';
            break;
    }
}

function spawnFood() {
    let validPosition = false;
    while (!validPosition) {
        food = {
            x: Math.floor(Math.random() * SNAKE_COLS),
            y: Math.floor(Math.random() * SNAKE_ROWS)
        };

        // Make sure food doesn't spawn on snake
        validPosition = true;
        for (let segment of snake) {
            if (segment.x === food.x && segment.y === food.y) {
                validPosition = false;
                break;
            }
        }
    }
}

function snakeGameLoop() {
    if (snakeGameOver) return;

    snakeDirection = snakeNextDirection;

    // Calculate new head position
    const head = { ...snake[0] };

    switch (snakeDirection) {
        case 'up':
            head.y--;
            break;
        case 'down':
            head.y++;
            break;
        case 'left':
            head.x--;
            break;
        case 'right':
            head.x++;
            break;
    }

    // Check wall collision
    if (head.x < 0 || head.x >= SNAKE_COLS || head.y < 0 || head.y >= SNAKE_ROWS) {
        gameOverSnake();
        return;
    }

    // Check self collision
    for (let segment of snake) {
        if (head.x === segment.x && head.y === segment.y) {
            gameOverSnake();
            return;
        }
    }

    // Add new head
    snake.unshift(head);

    // Check food collision
    if (head.x === food.x && head.y === food.y) {
        snakeScore += 10;
        updateSnakeScore();
        spawnFood();

        // Speed up slightly
        if (snakeSpeed > 50) {
            snakeSpeed -= 2;
            clearInterval(snakeInterval);
            snakeInterval = setInterval(snakeGameLoop, snakeSpeed);
        }
    } else {
        // Remove tail if no food eaten
        snake.pop();
    }

    drawSnake();
}

function drawSnake() {
    // Clear canvas
    snakeCtx.fillStyle = '#1a1a2e';
    snakeCtx.fillRect(0, 0, snakeCanvas.width, snakeCanvas.height);

    // Draw grid
    snakeCtx.strokeStyle = '#2a2a4e';
    for (let i = 0; i <= SNAKE_COLS; i++) {
        snakeCtx.beginPath();
        snakeCtx.moveTo(i * SNAKE_GRID_SIZE, 0);
        snakeCtx.lineTo(i * SNAKE_GRID_SIZE, snakeCanvas.height);
        snakeCtx.stroke();
    }
    for (let i = 0; i <= SNAKE_ROWS; i++) {
        snakeCtx.beginPath();
        snakeCtx.moveTo(0, i * SNAKE_GRID_SIZE);
        snakeCtx.lineTo(snakeCanvas.width, i * SNAKE_GRID_SIZE);
        snakeCtx.stroke();
    }

    // Draw food
    snakeCtx.fillStyle = '#ff6b6b';
    snakeCtx.beginPath();
    snakeCtx.arc(
        food.x * SNAKE_GRID_SIZE + SNAKE_GRID_SIZE / 2,
        food.y * SNAKE_GRID_SIZE + SNAKE_GRID_SIZE / 2,
        SNAKE_GRID_SIZE / 2 - 2,
        0,
        Math.PI * 2
    );
    snakeCtx.fill();

    // Draw food shine
    snakeCtx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    snakeCtx.beginPath();
    snakeCtx.arc(
        food.x * SNAKE_GRID_SIZE + SNAKE_GRID_SIZE / 2 - 3,
        food.y * SNAKE_GRID_SIZE + SNAKE_GRID_SIZE / 2 - 3,
        3,
        0,
        Math.PI * 2
    );
    snakeCtx.fill();

    // Draw snake
    for (let i = 0; i < snake.length; i++) {
        const segment = snake[i];
        const isHead = i === 0;

        // Gradient color from head to tail
        const greenValue = Math.floor(255 - (i / snake.length) * 100);
        snakeCtx.fillStyle = isHead ? '#00ff88' : `rgb(0, ${greenValue}, 100)`;

        // Draw rounded rectangle for snake segment
        const x = segment.x * SNAKE_GRID_SIZE + 1;
        const y = segment.y * SNAKE_GRID_SIZE + 1;
        const size = SNAKE_GRID_SIZE - 2;
        const radius = 5;

        snakeCtx.beginPath();
        snakeCtx.moveTo(x + radius, y);
        snakeCtx.lineTo(x + size - radius, y);
        snakeCtx.quadraticCurveTo(x + size, y, x + size, y + radius);
        snakeCtx.lineTo(x + size, y + size - radius);
        snakeCtx.quadraticCurveTo(x + size, y + size, x + size - radius, y + size);
        snakeCtx.lineTo(x + radius, y + size);
        snakeCtx.quadraticCurveTo(x, y + size, x, y + size - radius);
        snakeCtx.lineTo(x, y + radius);
        snakeCtx.quadraticCurveTo(x, y, x + radius, y);
        snakeCtx.closePath();
        snakeCtx.fill();

        // Draw eyes on head
        if (isHead) {
            snakeCtx.fillStyle = '#fff';
            let eyeX1, eyeX2, eyeY1, eyeY2;

            switch (snakeDirection) {
                case 'up':
                    eyeX1 = x + 4;
                    eyeX2 = x + size - 8;
                    eyeY1 = eyeY2 = y + 5;
                    break;
                case 'down':
                    eyeX1 = x + 4;
                    eyeX2 = x + size - 8;
                    eyeY1 = eyeY2 = y + size - 9;
                    break;
                case 'left':
                    eyeX1 = eyeX2 = x + 5;
                    eyeY1 = y + 4;
                    eyeY2 = y + size - 8;
                    break;
                case 'right':
                    eyeX1 = eyeX2 = x + size - 9;
                    eyeY1 = y + 4;
                    eyeY2 = y + size - 8;
                    break;
            }

            snakeCtx.beginPath();
            snakeCtx.arc(eyeX1 + 2, eyeY1 + 2, 3, 0, Math.PI * 2);
            snakeCtx.arc(eyeX2 + 2, eyeY2 + 2, 3, 0, Math.PI * 2);
            snakeCtx.fill();

            // Pupils
            snakeCtx.fillStyle = '#000';
            snakeCtx.beginPath();
            snakeCtx.arc(eyeX1 + 2, eyeY1 + 2, 1.5, 0, Math.PI * 2);
            snakeCtx.arc(eyeX2 + 2, eyeY2 + 2, 1.5, 0, Math.PI * 2);
            snakeCtx.fill();
        }
    }
}

function updateSnakeScore() {
    document.getElementById('score').textContent = snakeScore;
    document.getElementById('high-score').textContent = snakeHighScore;
}

function gameOverSnake() {
    snakeGameOver = true;
    clearInterval(snakeInterval);

    // Update high score
    if (snakeScore > snakeHighScore) {
        snakeHighScore = snakeScore;
        localStorage.setItem('snakeHighScore', snakeHighScore);
        updateSnakeScore();
    }

    // Draw game over screen
    snakeCtx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    snakeCtx.fillRect(0, 0, snakeCanvas.width, snakeCanvas.height);

    snakeCtx.fillStyle = '#fff';
    snakeCtx.font = 'bold 30px Arial';
    snakeCtx.textAlign = 'center';
    snakeCtx.fillText('游戏结束!', snakeCanvas.width / 2, snakeCanvas.height / 2 - 30);

    snakeCtx.font = '20px Arial';
    snakeCtx.fillText('分数: ' + snakeScore, snakeCanvas.width / 2, snakeCanvas.height / 2 + 10);

    if (snakeScore >= snakeHighScore && snakeScore > 0) {
        snakeCtx.fillStyle = '#00ff88';
        snakeCtx.fillText('🎉 新纪录!', snakeCanvas.width / 2, snakeCanvas.height / 2 + 45);
    }
}
