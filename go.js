// Go (围棋) Game
let goCanvas, goCtx;
let goBoard = [];
let currentPlayer = 'black'; // 'black' or 'white'
let goGameOver = false;
let blackCaptures = 0;
let whiteCaptures = 0;
let lastMove = null;
let passCount = 0;
let moveHistory = [];
let koPosition = null; // For ko rule

const GO_BOARD_SIZE = 19; // Standard Go board
const GO_CELL_SIZE = 30;
const GO_PADDING = 30;
const GO_STONE_RADIUS = 13;

function initGo() {
    goCanvas = document.getElementById('game-canvas');
    goCtx = goCanvas.getContext('2d');

    // Initialize empty board
    goBoard = [];
    for (let i = 0; i < GO_BOARD_SIZE; i++) {
        goBoard[i] = [];
        for (let j = 0; j < GO_BOARD_SIZE; j++) {
            goBoard[i][j] = null; // null = empty, 'black' or 'white'
        }
    }

    currentPlayer = 'black';
    goGameOver = false;
    blackCaptures = 0;
    whiteCaptures = 0;
    lastMove = null;
    passCount = 0;
    moveHistory = [];
    koPosition = null;

    updateGoInfo();
    drawGoBoard();

    goCanvas.addEventListener('click', goClickHandler);
}

function stopGo() {
    if (goCanvas) {
        goCanvas.removeEventListener('click', goClickHandler);
    }
}

function goClickHandler(e) {
    if (goGameOver) return;

    const rect = goCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Convert to board coordinates
    const col = Math.round((x - GO_PADDING) / GO_CELL_SIZE);
    const row = Math.round((y - GO_PADDING) / GO_CELL_SIZE);

    // Check if within bounds
    if (row < 0 || row >= GO_BOARD_SIZE || col < 0 || col >= GO_BOARD_SIZE) {
        return;
    }

    // Try to place stone
    if (placeStone(row, col)) {
        passCount = 0;
        drawGoBoard();
        updateGoInfo();
    }
}

function placeStone(row, col) {
    // Check if position is empty
    if (goBoard[row][col] !== null) {
        return false;
    }

    // Check ko rule
    if (koPosition && koPosition.row === row && koPosition.col === col) {
        return false;
    }

    // Temporarily place the stone
    goBoard[row][col] = currentPlayer;

    // Check for captures
    const opponent = currentPlayer === 'black' ? 'white' : 'black';
    let captured = [];

    // Check adjacent opponent groups for capture
    const adjacents = getAdjacent(row, col);
    for (const adj of adjacents) {
        if (goBoard[adj.row][adj.col] === opponent) {
            const group = getGroup(adj.row, adj.col);
            if (getLiberties(group).length === 0) {
                captured = captured.concat(group);
            }
        }
    }

    // Remove captured stones
    for (const stone of captured) {
        goBoard[stone.row][stone.col] = null;
    }

    // Update captures count
    if (captured.length > 0) {
        if (currentPlayer === 'black') {
            blackCaptures += captured.length;
        } else {
            whiteCaptures += captured.length;
        }
    }

    // Check if this move is suicide (no liberties and no captures)
    const ownGroup = getGroup(row, col);
    if (getLiberties(ownGroup).length === 0 && captured.length === 0) {
        // Suicide move - not allowed
        goBoard[row][col] = null;
        return false;
    }

    // Set ko position if exactly one stone was captured
    if (captured.length === 1 && ownGroup.length === 1) {
        koPosition = { row: captured[0].row, col: captured[0].col };
    } else {
        koPosition = null;
    }

    // Record move
    lastMove = { row, col };
    moveHistory.push({
        row, col,
        player: currentPlayer,
        captured: captured
    });

    // Switch player
    currentPlayer = opponent;

    return true;
}

function getAdjacent(row, col) {
    const adjacent = [];
    if (row > 0) adjacent.push({ row: row - 1, col });
    if (row < GO_BOARD_SIZE - 1) adjacent.push({ row: row + 1, col });
    if (col > 0) adjacent.push({ row, col: col - 1 });
    if (col < GO_BOARD_SIZE - 1) adjacent.push({ row, col: col + 1 });
    return adjacent;
}

function getGroup(row, col) {
    const color = goBoard[row][col];
    if (!color) return [];

    const group = [];
    const visited = new Set();
    const stack = [{ row, col }];

    while (stack.length > 0) {
        const pos = stack.pop();
        const key = `${pos.row},${pos.col}`;

        if (visited.has(key)) continue;
        if (goBoard[pos.row][pos.col] !== color) continue;

        visited.add(key);
        group.push(pos);

        const adjacents = getAdjacent(pos.row, pos.col);
        for (const adj of adjacents) {
            const adjKey = `${adj.row},${adj.col}`;
            if (!visited.has(adjKey) && goBoard[adj.row][adj.col] === color) {
                stack.push(adj);
            }
        }
    }

    return group;
}

function getLiberties(group) {
    const liberties = new Set();

    for (const stone of group) {
        const adjacents = getAdjacent(stone.row, stone.col);
        for (const adj of adjacents) {
            if (goBoard[adj.row][adj.col] === null) {
                liberties.add(`${adj.row},${adj.col}`);
            }
        }
    }

    return Array.from(liberties);
}

function passMove() {
    if (goGameOver) return;

    passCount++;
    koPosition = null;
    
    moveHistory.push({
        player: currentPlayer,
        pass: true
    });

    currentPlayer = currentPlayer === 'black' ? 'white' : 'black';

    if (passCount >= 2) {
        endGame();
    }

    updateGoInfo();
    drawGoBoard();
}

function endGame() {
    goGameOver = true;
    
    // Simple territory counting (basic implementation)
    const territory = countTerritory();
    
    const blackScore = territory.black + blackCaptures;
    const whiteScore = territory.white + whiteCaptures + 6.5; // Komi

    let winner;
    if (blackScore > whiteScore) {
        winner = '黑方';
    } else if (whiteScore > blackScore) {
        winner = '白方';
    } else {
        winner = '平局';
    }

    // Draw game over overlay
    goCtx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    goCtx.fillRect(0, 0, goCanvas.width, goCanvas.height);

    goCtx.fillStyle = '#fff';
    goCtx.font = 'bold 30px Arial';
    goCtx.textAlign = 'center';
    goCtx.fillText('游戏结束!', goCanvas.width / 2, goCanvas.height / 2 - 60);

    goCtx.font = '20px Arial';
    goCtx.fillText(`黑方: ${blackScore.toFixed(1)} 分`, goCanvas.width / 2, goCanvas.height / 2 - 20);
    goCtx.fillText(`白方: ${whiteScore.toFixed(1)} 分 (含贴目6.5)`, goCanvas.width / 2, goCanvas.height / 2 + 10);

    goCtx.fillStyle = '#00ff88';
    goCtx.font = 'bold 24px Arial';
    goCtx.fillText(`${winner} 获胜!`, goCanvas.width / 2, goCanvas.height / 2 + 50);
}

function countTerritory() {
    const visited = new Set();
    let blackTerritory = 0;
    let whiteTerritory = 0;

    for (let row = 0; row < GO_BOARD_SIZE; row++) {
        for (let col = 0; col < GO_BOARD_SIZE; col++) {
            if (goBoard[row][col] === null && !visited.has(`${row},${col}`)) {
                const result = floodFillTerritory(row, col, visited);
                if (result.owner === 'black') {
                    blackTerritory += result.size;
                } else if (result.owner === 'white') {
                    whiteTerritory += result.size;
                }
            }
        }
    }

    return { black: blackTerritory, white: whiteTerritory };
}

function floodFillTerritory(startRow, startCol, visited) {
    const territory = [];
    const stack = [{ row: startRow, col: startCol }];
    let touchesBlack = false;
    let touchesWhite = false;

    while (stack.length > 0) {
        const pos = stack.pop();
        const key = `${pos.row},${pos.col}`;

        if (visited.has(key)) continue;
        if (pos.row < 0 || pos.row >= GO_BOARD_SIZE || pos.col < 0 || pos.col >= GO_BOARD_SIZE) continue;

        const cell = goBoard[pos.row][pos.col];

        if (cell === 'black') {
            touchesBlack = true;
            continue;
        } else if (cell === 'white') {
            touchesWhite = true;
            continue;
        }

        visited.add(key);
        territory.push(pos);

        stack.push({ row: pos.row - 1, col: pos.col });
        stack.push({ row: pos.row + 1, col: pos.col });
        stack.push({ row: pos.row, col: pos.col - 1 });
        stack.push({ row: pos.row, col: pos.col + 1 });
    }

    let owner = null;
    if (touchesBlack && !touchesWhite) {
        owner = 'black';
    } else if (touchesWhite && !touchesBlack) {
        owner = 'white';
    }

    return { size: territory.length, owner };
}

function undoMove() {
    if (moveHistory.length === 0 || goGameOver) return;

    const lastMoveData = moveHistory.pop();

    if (lastMoveData.pass) {
        passCount = Math.max(0, passCount - 1);
    } else {
        // Remove the placed stone
        goBoard[lastMoveData.row][lastMoveData.col] = null;

        // Restore captured stones
        if (lastMoveData.captured) {
            const opponent = lastMoveData.player === 'black' ? 'white' : 'black';
            for (const stone of lastMoveData.captured) {
                goBoard[stone.row][stone.col] = opponent;
            }

            // Update captures count
            if (lastMoveData.player === 'black') {
                blackCaptures -= lastMoveData.captured.length;
            } else {
                whiteCaptures -= lastMoveData.captured.length;
            }
        }

        // Update last move marker
        if (moveHistory.length > 0) {
            const prevMove = moveHistory[moveHistory.length - 1];
            if (!prevMove.pass) {
                lastMove = { row: prevMove.row, col: prevMove.col };
            } else {
                lastMove = null;
            }
        } else {
            lastMove = null;
        }
    }

    // Switch back to previous player
    currentPlayer = lastMoveData.player;
    koPosition = null;

    updateGoInfo();
    drawGoBoard();
}

function drawGoBoard() {
    const canvasSize = GO_PADDING * 2 + GO_CELL_SIZE * (GO_BOARD_SIZE - 1);

    // Background
    goCtx.fillStyle = '#DEB887'; // Burlywood color for wooden board
    goCtx.fillRect(0, 0, canvasSize, canvasSize);

    // Draw grid lines
    goCtx.strokeStyle = '#000';
    goCtx.lineWidth = 1;

    for (let i = 0; i < GO_BOARD_SIZE; i++) {
        // Horizontal lines
        goCtx.beginPath();
        goCtx.moveTo(GO_PADDING, GO_PADDING + i * GO_CELL_SIZE);
        goCtx.lineTo(GO_PADDING + (GO_BOARD_SIZE - 1) * GO_CELL_SIZE, GO_PADDING + i * GO_CELL_SIZE);
        goCtx.stroke();

        // Vertical lines
        goCtx.beginPath();
        goCtx.moveTo(GO_PADDING + i * GO_CELL_SIZE, GO_PADDING);
        goCtx.lineTo(GO_PADDING + i * GO_CELL_SIZE, GO_PADDING + (GO_BOARD_SIZE - 1) * GO_CELL_SIZE);
        goCtx.stroke();
    }

    // Draw star points (hoshi)
    const starPoints = [
        [3, 3], [3, 9], [3, 15],
        [9, 3], [9, 9], [9, 15],
        [15, 3], [15, 9], [15, 15]
    ];

    goCtx.fillStyle = '#000';
    for (const [row, col] of starPoints) {
        goCtx.beginPath();
        goCtx.arc(
            GO_PADDING + col * GO_CELL_SIZE,
            GO_PADDING + row * GO_CELL_SIZE,
            4, 0, Math.PI * 2
        );
        goCtx.fill();
    }

    // Draw stones
    for (let row = 0; row < GO_BOARD_SIZE; row++) {
        for (let col = 0; col < GO_BOARD_SIZE; col++) {
            if (goBoard[row][col]) {
                drawStone(row, col, goBoard[row][col]);
            }
        }
    }

    // Draw last move marker
    if (lastMove) {
        const x = GO_PADDING + lastMove.col * GO_CELL_SIZE;
        const y = GO_PADDING + lastMove.row * GO_CELL_SIZE;
        const markerColor = goBoard[lastMove.row][lastMove.col] === 'black' ? '#fff' : '#000';

        goCtx.strokeStyle = markerColor;
        goCtx.lineWidth = 2;
        goCtx.beginPath();
        goCtx.arc(x, y, 6, 0, Math.PI * 2);
        goCtx.stroke();
    }

    // Draw coordinates
    goCtx.fillStyle = '#000';
    goCtx.font = '12px Arial';
    goCtx.textAlign = 'center';
    goCtx.textBaseline = 'middle';

    const letters = 'ABCDEFGHJKLMNOPQRST'; // Skip 'I'
    for (let i = 0; i < GO_BOARD_SIZE; i++) {
        // Top and bottom letters
        goCtx.fillText(letters[i], GO_PADDING + i * GO_CELL_SIZE, 12);
        goCtx.fillText(letters[i], GO_PADDING + i * GO_CELL_SIZE, canvasSize - 12);

        // Left and right numbers
        goCtx.fillText(GO_BOARD_SIZE - i, 12, GO_PADDING + i * GO_CELL_SIZE);
        goCtx.fillText(GO_BOARD_SIZE - i, canvasSize - 12, GO_PADDING + i * GO_CELL_SIZE);
    }
}

function drawStone(row, col, color) {
    const x = GO_PADDING + col * GO_CELL_SIZE;
    const y = GO_PADDING + row * GO_CELL_SIZE;

    // Stone shadow
    goCtx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    goCtx.beginPath();
    goCtx.arc(x + 2, y + 2, GO_STONE_RADIUS, 0, Math.PI * 2);
    goCtx.fill();

    // Stone gradient
    const gradient = goCtx.createRadialGradient(
        x - 4, y - 4, 0,
        x, y, GO_STONE_RADIUS
    );

    if (color === 'black') {
        gradient.addColorStop(0, '#555');
        gradient.addColorStop(1, '#000');
    } else {
        gradient.addColorStop(0, '#fff');
        gradient.addColorStop(1, '#ccc');
    }

    goCtx.fillStyle = gradient;
    goCtx.beginPath();
    goCtx.arc(x, y, GO_STONE_RADIUS, 0, Math.PI * 2);
    goCtx.fill();

    // Stone border
    goCtx.strokeStyle = color === 'black' ? '#000' : '#999';
    goCtx.lineWidth = 1;
    goCtx.stroke();
}

function updateGoInfo() {
    document.getElementById('current-player').textContent = currentPlayer === 'black' ? '黑方' : '白方';
    document.getElementById('current-player').style.color = currentPlayer === 'black' ? '#333' : '#fff';
    document.getElementById('current-player').style.background = currentPlayer === 'black' ? '#fff' : '#333';
    document.getElementById('current-player').style.padding = '5px 15px';
    document.getElementById('current-player').style.borderRadius = '15px';
    document.getElementById('black-captures').textContent = blackCaptures;
    document.getElementById('white-captures').textContent = whiteCaptures;
    document.getElementById('move-count').textContent = moveHistory.length;
}
