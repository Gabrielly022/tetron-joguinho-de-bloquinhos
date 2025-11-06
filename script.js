document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENTOS DA TELA PRINCIPAL (GAME) ---
    const grid = document.getElementById('grid');
    const gameWrapper = document.getElementById('game-wrapper');
    const startBtn = document.getElementById('start-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const restartBtn = document.getElementById('restart-btn');
    const scoreDisplay = document.getElementById('score');
    const timeDisplay = document.getElementById('time');
    const recordDisplay = document.getElementById('record');
    const playerNameDisplay = document.getElementById('player-name');

    // --- ELEMENTOS DA TELA INICIAL ---
    const startScreen = document.getElementById('start-screen');
    const startGameBtn = document.getElementById('start-game-btn');
    const startPlayerNameInput = document.getElementById('start-player-name');
    const showInstructionsBtn = document.getElementById('show-instructions-btn');

    // --- ELEMENTOS DO MODAL DE INSTRUÇÕES ---
    const modalInstructions = document.getElementById('modal-instructions');
    const closeBtn = document.querySelector('.close-btn');
    const modalCloseBtn = document.querySelector('.modal-close-btn');
    
    // --- ELEMENTOS DO PRÓXIMO BLOCO (NEXT PIECE) ---
    const nextGrid = document.getElementById('next-grid');
    let nextCells = [];
    const displayWidth = 4;


    // Constantes do Jogo
    const width = 10;
    const height = 20;
    const totalSquares = width * height;
    
    // Variáveis de Estado
    let cells = []; 
    let timerId; 
    let gameActive = false;
    let score = 0;
    let gameTime = 0;
    let timeInterval; 
    let highScore = 0;
    let highScorePlayer = "";
    let currentPosition = 4;
    let currentRotation = 0;
    let currentBlock; 
    let currentBlockIndex;
    let nextBlockIndex;
    
    // --- VARIÁVEIS DE DIFICULDADE ---
    let linesClearedCount = 0;
    let currentLevel = 1;
    let speed = 1000;
    const LINES_PER_LEVEL = 10;
    
    // ----------------------------------------------------
    // I. DEFINIÇÃO DOS BLOCOS (TETROMINOES)
    // ----------------------------------------------------

    const lBlock = [
        [1, width + 1, width * 2 + 1, 2],
        [width, width + 1, width + 2, width * 2 + 2],
        [1, width + 1, width * 2 + 1, width * 2],
        [width, width * 2, width * 2 + 1, width * 2 + 2]
    ];
    const zBlock = [
        [0, width, width + 1, width * 2 + 1],
        [width + 1, width + 2, width * 2, width * 2 + 1],
        [0, width, width + 1, width * 2 + 1],
        [width + 1, width + 2, width * 2, width * 2 + 1]
    ];
    const tBlock = [
        [1, width, width + 1, width + 2],
        [1, width + 1, width + 2, width * 2 + 1],
        [width, width + 1, width + 2, width * 2 + 1],
        [1, width, width + 1, width * 2 + 1]
    ];
    const oBlock = [
        [0, 1, width, width + 1],
        [0, 1, width, width + 1],
        [0, 1, width, width + 1],
        [0, 1, width, width + 1]
    ];
    const iBlock = [
        [1, width + 1, width * 2 + 1, width * 3 + 1],
        [width, width + 1, width + 2, width + 3],
        [1, width + 1, width * 2 + 1, width * 3 + 1],
        [width, width + 1, width + 2, width + 3]
    ];
    const jBlock = [
        [1, width + 1, width * 2 + 1, 0],
        [width, width + 1, width + 2, width * 2],
        [1, width + 1, width * 2 + 1, width * 2 + 2],
        [width + 2, width * 2, width * 2 + 1, width * 2 + 2]
    ];
    const sBlock = [
        [width * 2, width * 2 + 1, width + 1, width],
        [0, width, width + 1, width * 2 + 1],
        [width * 2, width * 2 + 1, width + 1, width],
        [0, width, width + 1, width * 2 + 1]
    ];

    const theBlocks = [lBlock, zBlock, tBlock, oBlock, iBlock, jBlock, sBlock];
    const blockClasses = ['block-L', 'block-Z', 'block-T', 'block-O', 'block-I', 'block-J', 'block-S'];

    const nextBlockPositions = [
        [1, displayWidth + 1, displayWidth * 2 + 1, 2], 
        [0, displayWidth, displayWidth + 1, displayWidth * 2 + 1], 
        [1, displayWidth, displayWidth + 1, displayWidth + 2],
        [1, 2, displayWidth + 1, displayWidth + 2], 
        [1, displayWidth + 1, displayWidth * 2 + 1, displayWidth * 3 + 1],
        [1, displayWidth + 1, displayWidth * 2 + 1, 0], 
        [displayWidth, displayWidth + 1, displayWidth * 2 + 1, displayWidth * 2],
    ];


    // ----------------------------------------------------
    // II. INICIALIZAÇÃO E TELAS
    // ----------------------------------------------------

    function createGrid() {
        for (let i = 0; i < totalSquares; i++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            grid.appendChild(cell);
            cells.push(cell);
        }
        for (let i = 0; i < width; i++) {
            const boundary = document.createElement('div');
            boundary.classList.add('boundary', 'taken'); 
            grid.appendChild(boundary);
            cells.push(boundary);
        }
    }
    
    function createNextGrid() {
        for (let i = 0; i < displayWidth * displayWidth; i++) {
            const cell = document.createElement('div');
            nextGrid.appendChild(cell);
            nextCells.push(cell);
        }
    }

    function displayNextBlock() {
        nextCells.forEach(cell => {
            cell.classList.remove('block', ...blockClasses);
        });

        nextBlockPositions[nextBlockIndex].forEach(index => {
            nextCells[index].classList.add('block', blockClasses[nextBlockIndex]);
        });
    }

    function showInstructionsModal() {
        modalInstructions.classList.remove('hidden');
    }

    function hideInstructionsModal() {
        modalInstructions.classList.add('hidden');
    }
    
    function hideStartScreen() {
        const playerName = startPlayerNameInput.value.trim();
        
        if (!playerName) {
            alert("Por favor, digite seu nome para começar!");
            return;
        }

        startScreen.classList.add('hidden');
        gameWrapper.classList.remove('hidden');

        playerNameDisplay.value = playerName;
        
        startGame(); 
    }

    function loadRecord() {
        const record = localStorage.getItem('tetrisHighScore');
        const player = localStorage.getItem('tetrisHighScorePlayer');
        if (record && player) {
            highScore = parseInt(record);
            highScorePlayer = player;
            recordDisplay.textContent = `${highScorePlayer}: ${highScore}`;
        } else {
            recordDisplay.textContent = "Nenhum";
        }
    }

    function saveRecord() {
        if (score > highScore) {
            highScore = score;
            highScorePlayer = playerNameDisplay.value || "Anônimo";
            localStorage.setItem('tetrisHighScore', highScore);
            localStorage.setItem('tetrisHighScorePlayer', highScorePlayer);
            loadRecord(); 
        }
    }
    
    // ----------------------------------------------------
    // III. RENDERIZAÇÃO E MOVIMENTO
    // ----------------------------------------------------

    function getNewBlock() {
        currentBlockIndex = nextBlockIndex !== undefined ? nextBlockIndex : Math.floor(Math.random() * theBlocks.length);
        nextBlockIndex = Math.floor(Math.random() * theBlocks.length);
        
        currentRotation = 0;
        currentPosition = 4;
        currentBlock = theBlocks[currentBlockIndex][currentRotation];
        
        displayNextBlock();
    }
    
    function drawBlock() {
        currentBlock.forEach(index => {
            const cellIndex = currentPosition + index;
            if (cells[cellIndex] && !cells[cellIndex].classList.contains('boundary')) {
                cells[cellIndex].classList.add('block', blockClasses[currentBlockIndex]);
            }
        });
    }

    function undrawBlock() {
        currentBlock.forEach(index => {
            const cellIndex = currentPosition + index;
            if (cells[cellIndex]) {
                cells[cellIndex].classList.remove('block', ...blockClasses);
            }
        });
    }

    function freezeBlock() {
        if (currentBlock.some(index => cells[currentPosition + index + width].classList.contains('taken'))) {
            
            currentBlock.forEach(index => {
                if (cells[currentPosition + index]) {
                    cells[currentPosition + index].classList.add('taken');
                }
            });

            if (timerId) {
                clearInterval(timerId);
                timerId = setInterval(moveDown, speed);
            }

            getNewBlock(); 
            drawBlock();
            
            addScore();
            checkGameOver();
        }
    }
    
    function updateSpeed() {
        const newSpeed = Math.max(100, 1000 - (currentLevel - 1) * 50); 
        
        if (newSpeed !== speed) {
            speed = newSpeed;
            
            if (timerId) {
                clearInterval(timerId);
                timerId = setInterval(moveDown, speed);
            }
        }
    }

    function moveDown() {
        undrawBlock();
        currentPosition += width;
        drawBlock();
        freezeBlock();
    }

    function hardDrop() {
        undrawBlock();
        
        while (!currentBlock.some(index => cells[currentPosition + index + width].classList.contains('taken'))) {
            currentPosition += width;
            score += 2;
        }
        
        drawBlock();
        freezeBlock();
    }
    
    function control(e) {
        if (!gameActive) return;

        if (['ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp', ' '].includes(e.key)) {
            e.preventDefault(); 
        }

        undrawBlock();
        if (e.key === 'ArrowLeft') { 
            moveLeft();
        } else if (e.key === 'ArrowRight') { 
            moveRight();
        } else if (e.key === 'ArrowDown') { 
            moveDown(); 
        } else if (e.key === 'ArrowUp') { 
            rotate();
        } else if (e.key === ' ') { 
            hardDrop();
        }
        drawBlock();
    }

    function moveLeft() {
        const isAtLeftEdge = currentBlock.some(index => (currentPosition + index) % width === 0);
        if (!isAtLeftEdge) currentPosition -= 1;

        if (currentBlock.some(index => cells[currentPosition + index].classList.contains('taken'))) {
            currentPosition += 1;
        }
    }

    function moveRight() {
        const isAtRightEdge = currentBlock.some(index => (currentPosition + index) % width === width - 1);
        if (!isAtRightEdge) currentPosition += 1;

        if (currentBlock.some(index => cells[currentPosition + index].classList.contains('taken'))) {
            currentPosition -= 1;
        }
    }

    function rotate() {
        const nextRotation = (currentRotation + 1) % 4;
        const nextBlock = theBlocks[currentBlockIndex][nextRotation];
        
        const isAtLeftEdge = nextBlock.some(index => (currentPosition + index) % width === 0);
        const isAtRightEdge = nextBlock.some(index => (currentPosition + index) % width === width - 1);

        if (!isAtLeftEdge && !isAtRightEdge) {
            currentRotation = nextRotation;
            currentBlock = nextBlock;
        }
    }

    // ----------------------------------------------------
    // IV. PONTUAÇÃO E FIM DE JOGO
    // ----------------------------------------------------

    function addScore() {
        for (let i = 0; i < totalSquares; i += width) {
            const row = [];
            for (let j = 0; j < width; j++) {
                row.push(cells[i + j]);
            }

            if (row.every(cell => cell.classList.contains('taken'))) {
                score += 10;
                linesClearedCount += 1;
                scoreDisplay.textContent = score;

                row.forEach(cell => {
                    cell.classList.remove('block', ...blockClasses, 'taken');
                });

                const removed = cells.splice(i, width);
                cells = removed.concat(cells);
                cells.forEach(cell => grid.appendChild(cell));

                currentLevel = Math.floor(linesClearedCount / LINES_PER_LEVEL) + 1;
                updateSpeed();
            }
        }

        saveRecord();
    }

    function checkGameOver() {
        if (currentBlock.some(index => cells[currentPosition + index].classList.contains('taken'))) {
            clearInterval(timerId);
            gameActive = false;
            alert(`Fim de jogo! Sua pontuação: ${score}`);
            saveRecord();
        }
    }

    function startGame() {
        if (gameActive) return;
        gameActive = true;

        createGrid();
        createNextGrid();
        loadRecord();
        getNewBlock();
        drawBlock();
        
        timerId = setInterval(moveDown, speed);

        timeInterval = setInterval(() => {
            gameTime++;
            timeDisplay.textContent = `${Math.floor(gameTime / 60)}:${('0'+gameTime % 60).slice(-2)}`;
        }, 1000);
    }

    function pauseGame() {
        if (!gameActive) return;

        clearInterval(timerId);
        clearInterval(timeInterval);
        gameActive = false;
    }

    function restartGame() {
        location.reload();
    }

    // ----------------------------------------------------
    // V. EVENT LISTENERS
    // ----------------------------------------------------
    
    startGameBtn.addEventListener('click', hideStartScreen);
    showInstructionsBtn.addEventListener('click', showInstructionsModal);
    closeBtn.addEventListener('click', hideInstructionsModal);
    modalCloseBtn.addEventListener('click', hideInstructionsModal);
    document.addEventListener('keydown', control);
    pauseBtn.addEventListener('click', pauseGame);
    restartBtn.addEventListener('click', restartGame);

    // ----------------------------------------------------
    // VI. ADICIONANDO LINK DO GITHUB (NOVO)
    // ----------------------------------------------------
    const githubLink = document.createElement('a');
    githubLink.href = 'https://github.com/Gabrielly022';
    githubLink.target = '_blank';
    githubLink.textContent = 'Meu GitHub';
    githubLink.style.position = 'absolute';
    githubLink.style.bottom = '10px';
    githubLink.style.right = '10px';
    githubLink.style.color = '#fff';
    githubLink.style.textDecoration = 'underline';
    githubLink.style.fontSize = '14px';
    
    document.body.appendChild(githubLink);
});
