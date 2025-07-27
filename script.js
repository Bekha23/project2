// Получение элементов DOM
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('high-score');
const gameOverElement = document.getElementById('gameOver');
const finalScoreElement = document.getElementById('finalScore');

// Кнопки управления
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const restartBtn = document.getElementById('restartBtn');
const playAgainBtn = document.getElementById('playAgainBtn');

// Константы игры
const GRID_SIZE = 20;
const TILE_COUNT = canvas.width / GRID_SIZE;

// Состояние игры
let gameState = {
    snake: [
        { x: 10, y: 10 }
    ],
    food: { x: 15, y: 15 },
    dx: 0,
    dy: 0,
    score: 0,
    isGameRunning: false,
    isPaused: false,
    gameLoop: null
};

// Загрузка рекорда из localStorage
let highScore = localStorage.getItem('snakeHighScore') || 0;
highScoreElement.textContent = highScore;

// Функция генерации случайной позиции для еды
function generateFood() {
    let newFood;
    do {
        newFood = {
            x: Math.floor(Math.random() * TILE_COUNT),
            y: Math.floor(Math.random() * TILE_COUNT)
        };
    } while (gameState.snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    
    return newFood;
}

// Функция отрисовки змейки
function drawSnake() {
    ctx.fillStyle = '#4CAF50';
    ctx.strokeStyle = '#2E7D32';
    ctx.lineWidth = 2;
    
    gameState.snake.forEach((segment, index) => {
        const x = segment.x * GRID_SIZE;
        const y = segment.y * GRID_SIZE;
        
        // Голова змейки отличается цветом
        if (index === 0) {
            ctx.fillStyle = '#2E7D32';
        } else {
            ctx.fillStyle = '#4CAF50';
        }
        
        // Рисуем сегмент с закругленными углами
        ctx.beginPath();
        ctx.roundRect(x + 1, y + 1, GRID_SIZE - 2, GRID_SIZE - 2, 4);
        ctx.fill();
        ctx.stroke();
    });
}

// Функция отрисовки еды
function drawFood() {
    const x = gameState.food.x * GRID_SIZE;
    const y = gameState.food.y * GRID_SIZE;
    
    // Рисуем еду как круг
    ctx.fillStyle = '#FF5722';
    ctx.strokeStyle = '#D84315';
    ctx.lineWidth = 2;
    
    ctx.beginPath();
    ctx.arc(x + GRID_SIZE / 2, y + GRID_SIZE / 2, GRID_SIZE / 2 - 2, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
    
    // Добавляем блик
    ctx.fillStyle = '#FFAB91';
    ctx.beginPath();
    ctx.arc(x + GRID_SIZE / 2 - 3, y + GRID_SIZE / 2 - 3, 3, 0, 2 * Math.PI);
    ctx.fill();
}

// Функция отрисовки игрового поля
function drawGame() {
    // Очистка canvas
    ctx.fillStyle = '#f7fafc';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Рисуем сетку
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    for (let i = 0; i <= TILE_COUNT; i++) {
        ctx.beginPath();
        ctx.moveTo(i * GRID_SIZE, 0);
        ctx.lineTo(i * GRID_SIZE, canvas.height);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(0, i * GRID_SIZE);
        ctx.lineTo(canvas.width, i * GRID_SIZE);
        ctx.stroke();
    }
    
    drawFood();
    drawSnake();
}

// Функция движения змейки
function moveSnake() {
    if (gameState.dx === 0 && gameState.dy === 0) return;
    
    const head = { x: gameState.snake[0].x + gameState.dx, y: gameState.snake[0].y + gameState.dy };
    
    // Проверка столкновения со стенами
    if (head.x < 0 || head.x >= TILE_COUNT || head.y < 0 || head.y >= TILE_COUNT) {
        gameOver();
        return;
    }
    
    // Проверка столкновения с самой собой
    if (gameState.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        gameOver();
        return;
    }
    
    gameState.snake.unshift(head);
    
    // Проверка поедания еды
    if (head.x === gameState.food.x && head.y === gameState.food.y) {
        gameState.score += 10;
        scoreElement.textContent = gameState.score;
        gameState.food = generateFood();
        
        // Проверка и обновление рекорда
        if (gameState.score > highScore) {
            highScore = gameState.score;
            highScoreElement.textContent = highScore;
            localStorage.setItem('snakeHighScore', highScore);
        }
    } else {
        gameState.snake.pop();
    }
}

// Основной игровой цикл
function gameLoop() {
    if (!gameState.isGameRunning || gameState.isPaused) return;
    
    moveSnake();
    drawGame();
}

// Функция начала игры
function startGame() {
    gameState.isGameRunning = true;
    gameState.isPaused = false;
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    
    if (!gameState.gameLoop) {
        gameState.gameLoop = setInterval(gameLoop, 150);
    }
    
    drawGame();
}

// Функция паузы
function pauseGame() {
    gameState.isPaused = !gameState.isPaused;
    
    if (gameState.isPaused) {
        pauseBtn.textContent = 'Продолжить';
        clearInterval(gameState.gameLoop);
        gameState.gameLoop = null;
    } else {
        pauseBtn.textContent = 'Пауза';
        gameState.gameLoop = setInterval(gameLoop, 150);
    }
}

// Функция перезапуска игры
function restartGame() {
    // Сброс состояния игры
    gameState.snake = [{ x: 10, y: 10 }];
    gameState.food = generateFood();
    gameState.dx = 0;
    gameState.dy = 0;
    gameState.score = 0;
    gameState.isGameRunning = false;
    gameState.isPaused = false;
    
    // Очистка интервала
    if (gameState.gameLoop) {
        clearInterval(gameState.gameLoop);
        gameState.gameLoop = null;
    }
    
    // Обновление UI
    scoreElement.textContent = '0';
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    pauseBtn.textContent = 'Пауза';
    gameOverElement.classList.add('hidden');
    
    drawGame();
}

// Функция окончания игры
function gameOver() {
    gameState.isGameRunning = false;
    clearInterval(gameState.gameLoop);
    gameState.gameLoop = null;
    
    finalScoreElement.textContent = gameState.score;
    gameOverElement.classList.remove('hidden');
    
    startBtn.disabled = false;
    pauseBtn.disabled = true;
}

// Обработка нажатий клавиш
function handleKeyPress(event) {
    if (!gameState.isGameRunning) return;
    
    const key = event.key;
    
    switch (key) {
        case 'ArrowUp':
            if (gameState.dy !== 1) {
                gameState.dx = 0;
                gameState.dy = -1;
            }
            break;
        case 'ArrowDown':
            if (gameState.dy !== -1) {
                gameState.dx = 0;
                gameState.dy = 1;
            }
            break;
        case 'ArrowLeft':
            if (gameState.dx !== 1) {
                gameState.dx = -1;
                gameState.dy = 0;
            }
            break;
        case 'ArrowRight':
            if (gameState.dx !== -1) {
                gameState.dx = 1;
                gameState.dy = 0;
            }
            break;
        case ' ':
            event.preventDefault();
            if (gameState.isGameRunning) {
                pauseGame();
            }
            break;
        case 'Enter':
            event.preventDefault();
            restartGame();
            break;
    }
}

// Добавление поддержки roundRect для старых браузеров
if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function(x, y, width, height, radius) {
        this.beginPath();
        this.moveTo(x + radius, y);
        this.lineTo(x + width - radius, y);
        this.quadraticCurveTo(x + width, y, x + width, y + radius);
        this.lineTo(x + width, y + height - radius);
        this.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        this.lineTo(x + radius, y + height);
        this.quadraticCurveTo(x, y + height, x, y + height - radius);
        this.lineTo(x, y + radius);
        this.quadraticCurveTo(x, y, x + radius, y);
        this.closePath();
    };
}

// Обработчики событий для кнопок
startBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', pauseGame);
restartBtn.addEventListener('click', restartGame);
playAgainBtn.addEventListener('click', () => {
    restartGame();
    startGame();
});

// Обработчик клавиатуры
document.addEventListener('keydown', handleKeyPress);

// Предотвращение прокрутки страницы стрелками
document.addEventListener('keydown', function(event) {
    if(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(event.key)) {
        event.preventDefault();
    }
});

// Инициализация игры
restartGame();