// Operation Pop! Game
class OperationPop extends BaseGame {
    constructor(container) {
        super(container);
        this.gameType = 'operation-pop';
        this.targetAnswer = 10;
        this.activeBalloons = [];
        this.gameTimer = null;
        this.gameTime = 60; // seconds
        this.timeRemaining = 60;
        this.gameActive = false;
        this.balloonsPopped = 0;
        this.nextBalloonId = 1;
        this.balloonSpawnInterval = null;
        // Speed and rules tuning (will be set per difficulty)
        this.speedBase = 0.6;
        this.speedIncrement = 0.03;
        this.speedMax = 1.5;
        this.allowedOperations = ['+'];
    }
    
    getTitleKey() {
        return 'game-3-title';
    }
    
    setupGame() {
        const gameArea = document.getElementById('gameArea');
        gameArea.innerHTML = `
            <div class="operationpop-container">
                <div class="game-header-info">
                    <div class="target-display">
                        <span data-i18n="operationpop-instructions">Pop all balloons that equal</span>
                        <span class="target-number" id="targetNumber">${this.targetAnswer}</span>
                    </div>
                    <div class="game-stats">
                        <div class="timer">
                            <span data-i18n="time">Time</span>: <span id="timeDisplay">${this.timeRemaining}</span>s
                        </div>
                        <div class="balloons-count">
                            <span data-i18n="operationpop-score">Balloons popped</span>: <span id="balloonsCount">${this.balloonsPopped}</span>
                        </div>
                    </div>
                </div>
                
                <div class="sky-area" id="skyArea">
                    <!-- Balloons will appear here -->
                </div>
                
                <div class="game-controls">
                    <button class="btn" id="startBtn">Start Game</button>
                    <button class="btn btn-secondary" id="pauseBtn" style="display: none;">Pause</button>
                </div>
                
                <div class="feedback" id="feedback"></div>
            </div>
        `;
        
        this.setupEventListeners();
        this.updateTargetAnswer();
        
        // Retranslate after adding content
        if (typeof i18n !== 'undefined') {
            i18n.translatePage();
        }
    }
    
    setupEventListeners() {
        const startBtn = document.getElementById('startBtn');
        const pauseBtn = document.getElementById('pauseBtn');
        
        startBtn.addEventListener('click', () => this.startGame());
        pauseBtn.addEventListener('click', () => this.pauseGame());
        
        // Keyboard support for accessibility
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && this.gameActive) {
                e.preventDefault();
                this.pauseGame();
            }
        });
    }
    
    updateTargetAnswer() {
        // Set target based on difficulty
        switch(this.difficulty) {
            case 'easy':
                this.targetAnswer = MathGames.randomBetween(5, 10);
                this.gameTime = 120; // More time for easy mode (2 minutes)
                this.allowedOperations = ['+'];
                this.speedBase = 0.4;       // very gentle start
                this.speedIncrement = 0.02; // small increase per correct pop
                this.speedMax = 1.0;        // easy cap
                break;
            case 'medium':
                this.targetAnswer = MathGames.randomBetween(8, 15);
                this.gameTime = 90; // 1.5 minutes
                this.allowedOperations = ['+', '-'];
                this.speedBase = 0.6;
                this.speedIncrement = 0.03;
                this.speedMax = 1.5;
                break;
            case 'hard':
                this.targetAnswer = MathGames.randomBetween(10, 20);
                this.gameTime = 60; // 1 minute
                this.allowedOperations = ['+', '-', '*']; // introduce multiplication sometimes
                this.speedBase = 0.8;
                this.speedIncrement = 0.04;
                this.speedMax = 2.0; // keep visible/readable
                break;
        }
        
        document.getElementById('targetNumber').textContent = this.targetAnswer;
    }
    
    startGame() {
        this.gameActive = true;
        this.timeRemaining = this.gameTime;
        this.balloonsPopped = 0;
        this.activeBalloons = [];
        this.nextBalloonId = 1;
        // Reset problem timer for pop-based tracking
        this.problemStartTime = null;
        
        // Update UI
        document.getElementById('startBtn').style.display = 'none';
        document.getElementById('pauseBtn').style.display = 'inline-block';
        document.getElementById('balloonsCount').textContent = this.balloonsPopped;
        document.getElementById('skyArea').innerHTML = '';
        
        // Start timers
        this.startGameTimer();
        this.startBalloonSpawning();
        this.startGameLoop();
    }
    
    pauseGame() {
        this.gameActive = !this.gameActive;
        const pauseBtn = document.getElementById('pauseBtn');
        
        if (this.gameActive) {
            pauseBtn.textContent = 'Pause';
            this.startGameTimer();
            this.startBalloonSpawning();
            this.startGameLoop();
        } else {
            pauseBtn.textContent = 'Resume';
            this.stopGameTimer();
            this.stopBalloonSpawning();
        }
    }
    
    endGame() {
        this.gameActive = false;
        this.stopGameTimer();
        this.stopBalloonSpawning();
        
        // Update UI
        document.getElementById('startBtn').style.display = 'inline-block';
        document.getElementById('startBtn').textContent = 'Play Again';
        document.getElementById('pauseBtn').style.display = 'none';
        
        // Show results
        this.showGameResults();
        
        // Update score
        this.updateScore(this.balloonsPopped * 5);
        
        if (this.score > 0 && this.score % 100 === 0) {
            this.updateLevel();
            this.updateTargetAnswer();
        }
    }
    
    startGameTimer() {
        this.gameTimer = setInterval(() => {
            this.timeRemaining--;
            document.getElementById('timeDisplay').textContent = this.timeRemaining;
            
            if (this.timeRemaining <= 0) {
                this.endGame();
            }
        }, 1000);
    }
    
    stopGameTimer() {
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
            this.gameTimer = null;
        }
    }
    
    startBalloonSpawning() {
        // Slower spawn rates for younger children - easy mode is much slower
        const spawnRate = this.difficulty === 'easy' ? 3000 : (this.difficulty === 'medium' ? 2000 : 1500);
        
        this.balloonSpawnInterval = setInterval(() => {
            if (this.gameActive) {
                this.spawnBalloon();
            }
        }, spawnRate);
    }
    
    stopBalloonSpawning() {
        if (this.balloonSpawnInterval) {
            clearInterval(this.balloonSpawnInterval);
            this.balloonSpawnInterval = null;
        }
    }
    
    spawnBalloon() {
        const skyArea = document.getElementById('skyArea');
        // More correct balloons in easy mode to build confidence
        const correctRate = this.difficulty === 'easy' ? 0.7 : 0.6; // 70% correct in easy, 60% in others
        const isCorrect = Math.random() > (1 - correctRate);
        
        let equation, answer;
        if (isCorrect) {
            equation = this.generateCorrectEquation();
            answer = this.targetAnswer;
        } else {
            equation = this.generateIncorrectEquation();
            answer = this.evaluateEquation(equation);
        }
        
        const currentSpeed = Math.min(this.speedBase + this.balloonsPopped * this.speedIncrement, this.speedMax);
        const speed = this.randomFloat(Math.max(0.2, currentSpeed * 0.8), currentSpeed * 1.2);

        const balloon = {
            id: this.nextBalloonId++,
            equation: equation,
            answer: answer,
            isCorrect: isCorrect,
            x: MathGames.randomBetween(10, 90), // percentage
            y: -15, // start slightly below the visible area
            speed: speed,
            color: this.getBalloonColor(isCorrect)
        };
        
        this.activeBalloons.push(balloon);
        this.createBalloonElement(balloon);
    }
    
    generateCorrectEquation() {
        // Choose an operation allowed for this difficulty
        let ops = this.allowedOperations;
        let operation = ops[Math.floor(Math.random() * ops.length)];

        // Try to build a correct equation that equals targetAnswer
        if (operation === '+') {
            const a = MathGames.randomBetween(1, Math.max(2, this.targetAnswer - 1));
            const b = this.targetAnswer - a;
            return `${a}+${b}`;
        } else if (operation === '-') {
            const a = MathGames.randomBetween(this.targetAnswer, this.targetAnswer + 10);
            const b = a - this.targetAnswer;
            return `${a}-${b}`;
        } else if (operation === '*') {
            // Only possible if targetAnswer has factors in 2..12 range
            const factors = [];
            for (let i = 2; i <= 12; i++) {
                if (this.targetAnswer % i === 0) {
                    const j = this.targetAnswer / i;
                    if (j >= 2 && j <= 12) factors.push([i, j]);
                }
            }
            if (factors.length) {
                const pair = factors[Math.floor(Math.random() * factors.length)];
                return `${pair[0]}*${pair[1]}`;
            } else {
                // Fallback to addition if multiplication can't hit the target
                const a = MathGames.randomBetween(1, Math.max(2, this.targetAnswer - 1));
                const b = this.targetAnswer - a;
                return `${a}+${b}`;
            }
        }
        // Default fallback
        const a = MathGames.randomBetween(1, Math.max(2, this.targetAnswer - 1));
        const b = this.targetAnswer - a;
        return `${a}+${b}`;
    }
    
    generateIncorrectEquation() {
        // Choose an operation from those allowed; rotate until we get one not equal to target
        let equation;
        let safety = 0;
        do {
            const ops = this.allowedOperations;
            const operation = ops[Math.floor(Math.random() * ops.length)];
            if (operation === '+') {
                const a = MathGames.randomBetween(1, 20);
                const b = MathGames.randomBetween(1, 20);
                equation = `${a}+${b}`;
            } else if (operation === '-') {
                const a = MathGames.randomBetween(1, 25);
                const b = MathGames.randomBetween(0, a); // allow zero to broaden variety
                equation = `${a}-${b}`;
            } else if (operation === '*') {
                const a = MathGames.randomBetween(2, 12);
                const b = MathGames.randomBetween(2, 12);
                equation = `${a}*${b}`;
            }
            safety++;
            if (safety > 50) break; // avoid infinite loop
        } while (this.evaluateEquation(equation) === this.targetAnswer);
        return equation;
    }
    
    evaluateEquation(equation) {
        // Simple equation evaluator for one-operator expressions: +, -, *
        if (equation.includes('+')) {
            const parts = equation.split('+');
            return parseInt(parts[0]) + parseInt(parts[1]);
        } else if (equation.includes('-')) {
            const parts = equation.split('-');
            return parseInt(parts[0]) - parseInt(parts[1]);
        } else if (equation.includes('*')) {
            const parts = equation.split('*');
            return parseInt(parts[0]) * parseInt(parts[1]);
        }
        return 0;
    }
    
    getBalloonColor(_isCorrect) {
        // Colors are random and not tied to correctness to avoid implicit feedback
        const palette = [
            '#3F51B5', // indigo
            '#673AB7', // deep purple
            '#8E24AA', // purple
            '#D81B60', // pink (dark)
            '#1976D2', // blue
            '#0097A7', // cyan (dark)
            '#00897B', // teal (dark)
            '#5D4037', // brown
            '#455A64', // blue grey
            '#F57C00'  // deep orange (sufficient contrast with white)
        ];
        return palette[Math.floor(Math.random() * palette.length)];
    }
    
    createBalloonElement(balloon) {
        const skyArea = document.getElementById('skyArea');
        const balloonElement = document.createElement('div');
        balloonElement.className = 'balloon';
        balloonElement.setAttribute('data-id', balloon.id);
        balloonElement.style.cssText = `
            left: ${balloon.x}%;
            bottom: ${balloon.y}%;
            background-color: ${balloon.color};
        `;
        balloonElement.innerHTML = `
            <div class="balloon-string"></div>
            <div class="balloon-equation">${balloon.equation}</div>
        `;
        
        // Add click/touch event
        balloonElement.addEventListener('click', (e) => {
            e.preventDefault();
            this.popBalloon(balloon.id);
        });
        
        // Add touch support
        balloonElement.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.popBalloon(balloon.id);
        });
        
        skyArea.appendChild(balloonElement);
    }
    
    startGameLoop() {
        if (!this.gameActive) return;
        
        // Update balloon positions (rise from bottom to top)
        this.activeBalloons.forEach(balloon => {
            balloon.y += balloon.speed;
        });
        
        // Remove balloons that are off-screen (top)
        this.activeBalloons = this.activeBalloons.filter(balloon => {
            if (balloon.y > 110) {
                const element = document.querySelector(`[data-id="${balloon.id}"]`);
                if (element) {
                    element.remove();
                }
                return false;
            }
            return true;
        });
        
        // Update visual positions
        this.activeBalloons.forEach(balloon => {
            const element = document.querySelector(`[data-id="${balloon.id}"]`);
            if (element) {
                element.style.bottom = `${balloon.y}%`;
            }
        });
        
        // Continue game loop
        if (this.gameActive) {
            requestAnimationFrame(() => this.startGameLoop());
        }
    }
    
    popBalloon(balloonId) {
        const balloonIndex = this.activeBalloons.findIndex(b => b.id === balloonId);
        if (balloonIndex === -1) return;
        
        const balloon = this.activeBalloons[balloonIndex];
        const balloonElement = document.querySelector(`[data-id="${balloonId}"]`);
        
        if (balloon.isCorrect) {
            // Correct balloon popped
            this.playSound('pop');
            this.balloonsPopped++;
            document.getElementById('balloonsCount').textContent = this.balloonsPopped;
            // Record achievement progress per correct pop
            this.recordCorrectAnswer();
            
            // Animate successful pop
            if (balloonElement) {
                balloonElement.classList.add('pop-success');
                setTimeout(() => balloonElement.remove(), 300);
            }
            
        } else {
            // Wrong balloon popped
            this.playSound('wrong');
            // Record incorrect pop
            this.recordIncorrectAnswer();
            
            // Animate wrong pop
            if (balloonElement) {
                balloonElement.classList.add('pop-wrong');
                setTimeout(() => {
                    balloonElement.classList.remove('pop-wrong');
                }, 600);
            }
            return; // Don't remove wrong balloons
        }
        
        // Remove balloon from active list
        this.activeBalloons.splice(balloonIndex, 1);
    }

    // Helper: random float between min and max
    randomFloat(min, max) {
        return Math.random() * (max - min) + min;
    }
    
    showGameResults() {
        const feedback = document.getElementById('feedback');
        let message = '';
        let performance = '';
        
        if (this.balloonsPopped >= 30) {
            performance = '🏆 Amazing!';
        } else if (this.balloonsPopped >= 20) {
            performance = '⭐ Great job!';
        } else if (this.balloonsPopped >= 10) {
            performance = '👍 Good work!';
        } else {
            performance = '💪 Keep practicing!';
        }
        
        message = `
            <div class="game-results">
                <div class="performance">${performance}</div>
                <div class="final-score">You popped ${this.balloonsPopped} correct balloons!</div>
                <div class="target-info">Target was ${this.targetAnswer}</div>
            </div>
        `;
        
        feedback.innerHTML = message;
        
        setTimeout(() => {
            feedback.innerHTML = '';
        }, 4000);
    }
    
    onDifficultyChange() {
        this.updateTargetAnswer();
        // Reset game if it's running
        if (this.gameActive) {
            this.endGame();
        }
    }
    
    restart() {
        this.gameActive = false;
        this.stopGameTimer();
        this.stopBalloonSpawning();
        this.balloonsPopped = 0;
        this.timeRemaining = this.gameTime;
        super.restart();
    }
}

// Add CSS for Operation Pop!
const operationPopCSS = `
<style>
.operationpop-container {
    position: relative;
    height: 100%;
    min-height: 500px;
}

.game-header-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    flex-wrap: wrap;
    gap: 1rem;
}

.target-display {
    font-size: 1.5rem;
    font-weight: bold;
    color: var(--primary-color);
    text-align: center;
}

.target-number {
    background: var(--accent-color);
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 25px;
    margin-left: 0.5rem;
    font-size: 2rem;
    display: inline-block;
    min-width: 60px;
}

.game-stats {
    display: flex;
    gap: 2rem;
    align-items: center;
    flex-wrap: wrap;
}

.timer, .balloons-count {
    background: var(--background-color);
    padding: 0.5rem 1rem;
    border-radius: 15px;
    border: 2px solid var(--border-color);
    font-weight: bold;
}

.sky-area {
    position: relative;
    background: linear-gradient(to bottom, #87CEEB 0%, #98D8E8 50%, #F0F8FF 100%);
    border: 3px solid var(--border-color);
    border-radius: 15px;
    height: 400px;
    overflow: hidden;
    margin: 1rem 0;
}

.balloon {
    position: absolute;
    width: 80px;
    height: 100px;
    border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
    cursor: pointer;
    transition: transform 0.1s ease;
    user-select: none;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: bold;
    font-size: 0.9rem;
    text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
}

.balloon:hover {
    transform: scale(1.1);
}

.balloon:active {
    transform: scale(0.95);
}

.balloon-string {
    position: absolute;
    bottom: -20px;
    left: 50%;
    transform: translateX(-50%);
    width: 1px;
    height: 20px;
    background: #333;
}

.balloon-equation {
    text-align: center;
    line-height: 1.2;
    padding: 0 5px;
    word-break: break-all;
}

.balloon.pop-success {
    animation: popSuccess 0.3s ease-out forwards;
}

.balloon.pop-wrong {
    animation: popWrong 0.6s ease-in-out;
}

@keyframes popSuccess {
    0% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.3); opacity: 0.8; }
    100% { transform: scale(0); opacity: 0; }
}

@keyframes popWrong {
    0% { transform: translateX(0); }
    25% { transform: translateX(-10px); background-color: #F44336; }
    50% { transform: translateX(10px); }
    75% { transform: translateX(-5px); }
    100% { transform: translateX(0); }
}

.game-results {
    background: var(--card-background);
    border: 3px solid var(--primary-color);
    border-radius: 20px;
    padding: 2rem;
    text-align: center;
    margin: 1rem 0;
    box-shadow: var(--shadow);
}

.performance {
    font-size: 2rem;
    margin-bottom: 1rem;
    color: var(--primary-color);
    font-family: var(--font-primary);
}

.final-score {
    font-size: 1.5rem;
    font-weight: bold;
    margin-bottom: 0.5rem;
    color: var(--text-color);
}

.target-info {
    font-size: 1rem;
    color: var(--text-light);
}

/* Cloud decorations */
.sky-area::before {
    content: '☁️';
    position: absolute;
    top: 20px;
    left: 20%;
    font-size: 2rem;
    opacity: 0.7;
    animation: float 6s ease-in-out infinite;
}

.sky-area::after {
    content: '☁️';
    position: absolute;
    top: 40px;
    right: 30%;
    font-size: 1.5rem;
    opacity: 0.6;
    animation: float 8s ease-in-out infinite reverse;
}

@keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
}

@media (max-width: 768px) {
    .game-header-info {
        flex-direction: column;
        text-align: center;
    }
    
    .target-display {
        font-size: 1.2rem;
    }
    
    .target-number {
        font-size: 1.5rem;
        padding: 0.3rem 0.8rem;
    }
    
    .game-stats {
        gap: 1rem;
        justify-content: center;
    }
    
    .sky-area {
        height: 300px;
    }
    
    .balloon {
        width: 60px;
        height: 75px;
        font-size: 0.8rem;
    }
}

@media (max-width: 480px) {
    .target-display {
        font-size: 1rem;
    }
    
    .game-stats {
        flex-direction: column;
        gap: 0.5rem;
    }
    
    .sky-area {
        height: 250px;
    }
    
    .balloon {
        width: 50px;
        height: 65px;
        font-size: 0.7rem;
    }
    
    .performance {
        font-size: 1.5rem;
    }
    
    .final-score {
        font-size: 1.2rem;
    }
}

/* Touch device optimizations */
@media (hover: none) and (pointer: coarse) {
    .balloon {
        width: 90px;
        height: 110px;
        font-size: 1rem;
    }
    
    .balloon:hover {
        transform: none;
    }
}
</style>
`;

// Inject CSS
document.head.insertAdjacentHTML('beforeend', operationPopCSS);