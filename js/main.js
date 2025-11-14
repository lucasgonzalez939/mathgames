// Main JavaScript file for Math Games
class MathGames {
    constructor() {
        this.currentGame = null;
        this.gameInstances = {};
        this.init();
    }
    
    init() {
        const boot = () => {
            this.setupEventListeners();
            this.showHomePage();
        };
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', boot);
        } else {
            // DOM is already ready (scripts at end of body) – initialize immediately
            boot();
        }
    }
    
    setupEventListeners() {
        // Home button
        const homeBtn = document.getElementById('homeBtn');
        homeBtn.addEventListener('click', () => this.showHomePage());
        
        // Restart button
        const restartBtn = document.getElementById('restartBtn');
        restartBtn.addEventListener('click', () => this.restartCurrentGame());
        
        // Game cards
        const gameCards = document.querySelectorAll('.game-card');
        gameCards.forEach(card => {
            card.addEventListener('click', () => {
                const gameType = card.getAttribute('data-game');
                this.loadGame(gameType);
            });
            
            // Add keyboard support
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const gameType = card.getAttribute('data-game');
                    this.loadGame(gameType);
                }
            });
            
            // Make cards focusable
            card.setAttribute('tabindex', '0');
        });
        
        // Touch events for better mobile experience
        gameCards.forEach(card => {
            card.addEventListener('touchstart', (e) => {
                card.style.transform = 'translateY(-2px)';
            });
            
            card.addEventListener('touchend', (e) => {
                card.style.transform = '';
            });
        });
    }
    
    showHomePage() {
        this.currentGame = null;
        document.getElementById('homePage').classList.add('active');
        document.getElementById('gamePage').classList.remove('active');
        document.getElementById('restartBtn').style.display = 'none';
        
        // Update page title
        document.title = i18n.get('main-title');
    }
    
    showGamePage() {
        document.getElementById('homePage').classList.remove('active');
        document.getElementById('gamePage').classList.add('active');
        document.getElementById('restartBtn').style.display = 'inline-block';
    }
    
    loadGame(gameType) {
        this.currentGame = gameType;
        this.showGamePage();
        
        // Clear previous game content
        const gamePage = document.getElementById('gamePage');
        gamePage.innerHTML = '';
        
        // Load the specific game with a safety net to surface errors in UI
        try {
            switch(gameType) {
                case 'number-line-leap':
                    this.gameInstances[gameType] = new NumberLineLeap(gamePage);
                    break;
                case 'math-stacker':
                    this.gameInstances[gameType] = new MathStacker(gamePage);
                    break;
                case 'operation-pop':
                    this.gameInstances[gameType] = new OperationPop(gamePage);
                    break;
                case 'fact-family-farm':
                    this.gameInstances[gameType] = new FactFamilyFarm(gamePage);
                    break;
                case 'place-value-puzzles':
                    this.gameInstances[gameType] = new PlaceValuePuzzles(gamePage);
                    break;
                case 'storekeeper-stories':
                    if (typeof StorekeeperStories !== 'function') {
                        throw new Error('StorekeeperStories is not available. Check that js/games/storekeeper-stories.js is loaded.');
                    }
                    this.gameInstances[gameType] = new StorekeeperStories(gamePage);
                    break;
                case 'pattern-painter':
                    if (typeof PatternPainter !== 'function') {
                        throw new Error('PatternPainter is not available. Check that js/games/pattern-painter.js is loaded.');
                    }
                    this.gameInstances[gameType] = new PatternPainter(gamePage);
                    break;
                case 'fraction-forest-run':
                    if (typeof FractionForestRun !== 'function') {
                        throw new Error('FractionForestRun is not available. Check that js/games/fraction-forest-run.js is loaded.');
                    }
                    this.gameInstances[gameType] = new FractionForestRun(gamePage);
                    break;
                case 'galaxy-math-defender':
                    if (typeof GalaxyMathDefender !== 'function') {
                        throw new Error('GalaxyMathDefender is not available. Check that js/games/galaxy-math-defender.js is loaded.');
                    }
                    this.gameInstances[gameType] = new GalaxyMathDefender(gamePage);
                    break;
                default:
                    console.error('Unknown game type:', gameType);
                    this.showHomePage();
                    return;
            }
        } catch (err) {
            console.error('Failed to load game', gameType, err);
            gamePage.innerHTML = `
                <div class="error-panel">
                    <h3>Oops! We couldn't load this game.</h3>
                    <p>${(err && err.message) ? err.message : 'An unexpected error occurred.'}</p>
                    <button class="btn" id="backHomeBtn">Back to Home</button>
                </div>
            `;
            const backHomeBtn = document.getElementById('backHomeBtn');
            if (backHomeBtn) backHomeBtn.addEventListener('click', () => this.showHomePage());
            return;
        }
        
        // Update page title
        const gameTitle = i18n.get(`game-${this.getGameNumber(gameType)}-title`);
        document.title = `${gameTitle} - ${i18n.get('nav-title')}`;
        
        // Start tutorial if user hasn't seen it for this game
        if (typeof tutorialSystem !== 'undefined' && tutorialSystem.shouldShowTutorial(gameType)) {
            // Small delay to ensure game UI is fully rendered
            setTimeout(() => {
                tutorialSystem.startTutorial(gameType);
            }, 500);
        }

        // Defensive: some games rely on difficulty change to (re)generate state.
        // Trigger a no-op difficulty refresh to avoid a blank initial state.
        try {
            if (this.gameInstances[gameType] && typeof this.gameInstances[gameType].onDifficultyChange === 'function') {
                this.gameInstances[gameType].onDifficultyChange();
            }
        } catch (e) {
            console.warn('Difficulty refresh failed:', e);
        }
    }
    
    getGameNumber(gameType) {
        const gameMap = {
            'number-line-leap': '1',
            'math-stacker': '2',
            'operation-pop': '3',
            'fact-family-farm': '4',
            'place-value-puzzles': '5',
            'storekeeper-stories': '6',
            'pattern-painter': '7',
            'fraction-forest-run': '8',
            'galaxy-math-defender': '9'
        };
        return gameMap[gameType] || '1';
    }
    
    restartCurrentGame() {
        if (this.currentGame && this.gameInstances[this.currentGame]) {
            this.gameInstances[this.currentGame].restart();
        }
    }
    
    // Utility methods for games
    static playSound(type) {
        // Create audio context for sound effects
        if (typeof AudioContext !== 'undefined' || typeof webkitAudioContext !== 'undefined') {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            const audioContext = new AudioCtx();
            
            let frequency;
            let duration;
            
            switch(type) {
                case 'correct':
                    frequency = 523.25; // C5
                    duration = 0.3;
                    break;
                case 'wrong':
                    frequency = 146.83; // D3
                    duration = 0.2;
                    break;
                case 'pop':
                    frequency = 880; // A5
                    duration = 0.1;
                    break;
                case 'success':
                    // Play a success melody
                    MathGames.playSuccessMelody(audioContext);
                    return;
                default:
                    return;
            }
            
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = frequency;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + duration);
        }
    }
    
    static playSuccessMelody(audioContext) {
        const notes = [
            { frequency: 523.25, time: 0, duration: 0.2 }, // C5
            { frequency: 659.25, time: 0.2, duration: 0.2 }, // E5
            { frequency: 783.99, time: 0.4, duration: 0.4 }  // G5
        ];
        
        notes.forEach(note => {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = note.frequency;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.2, audioContext.currentTime + note.time);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + note.time + note.duration);
            
            oscillator.start(audioContext.currentTime + note.time);
            oscillator.stop(audioContext.currentTime + note.time + note.duration);
        });
    }
    
    static createButton(text, className = 'btn', onClick = null) {
        const button = document.createElement('button');
        button.textContent = text;
        button.className = className;
        if (onClick) {
            button.addEventListener('click', onClick);
        }
        return button;
    }
    
    static createElement(tag, className = '', textContent = '') {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (textContent) element.textContent = textContent;
        return element;
    }
    
    static animateElement(element, animationClass, duration = 600) {
        return new Promise(resolve => {
            element.classList.add(animationClass);
            setTimeout(() => {
                element.classList.remove(animationClass);
                resolve();
            }, duration);
        });
    }
    
    static getEncouragingMessage() {
        const messages = [
            "Amazing!",
            "Fantastic!",
            "Great job!",
            "You're a star!",
            "Brilliant!",
            "Wonderful!",
            "Excellent!",
            "Super work!",
            "You did it!",
            "Perfect!",
            "Outstanding!",
            "You're awesome!",
            "Incredible!",
            "Way to go!",
            "Spectacular!"
        ];
        return messages[Math.floor(Math.random() * messages.length)];
    }
    
    static getTryAgainMessage() {
        const messages = [
            "Try again! You can do it!",
            "Almost there! Give it another try!",
            "Not quite, but keep trying!",
            "You're learning! Try once more!",
            "Keep going! You've got this!",
            "Good effort! Try again!",
            "So close! One more time!",
            "You're getting better! Try again!"
        ];
        return messages[Math.floor(Math.random() * messages.length)];
    }
    
    static randomBetween(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
    static shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
    
    // Math utility functions
    static generateAddition(maxNum = 10, allowCarrying = false) {
        let a, b;
        if (allowCarrying) {
            a = MathGames.randomBetween(1, maxNum);
            b = MathGames.randomBetween(1, maxNum);
        } else {
            a = MathGames.randomBetween(1, maxNum);
            b = MathGames.randomBetween(1, maxNum - a);
        }
        return { a, b, answer: a + b, operator: '+' };
    }
    
    static generateSubtraction(maxNum = 10) {
        const a = MathGames.randomBetween(1, maxNum);
        const b = MathGames.randomBetween(1, a);
        return { a, b, answer: a - b, operator: '-' };
    }
    
    static generateNumberBonds(target) {
        const pairs = [];
        for (let i = 1; i < target; i++) {
            pairs.push([i, target - i]);
        }
        return pairs;
    }
}

// Base Game Class
class BaseGame {
    constructor(container) {
        this.container = container;
        this.score = 0;
        this.level = 1;
        this.difficulty = 'easy';
        this.gameType = null; // Will be set by child class
        this.problemStartTime = null;
        this.createGameStructure();
    }
    
    createGameStructure() {
        // Common game structure
        this.container.innerHTML = `
            <div class="game-header">
                <h2 class="game-title" data-i18n="${this.getTitleKey()}"></h2>
                <div class="game-score">
                    <span data-i18n="score">Score</span>: <span id="scoreValue">${this.score}</span> | 
                    <span data-i18n="level">Level</span>: <span id="levelValue">${this.level}</span>
                </div>
                <div class="difficulty-selector">
                    <button class="difficulty-btn active" data-difficulty="easy" data-i18n="difficulty-easy">Easy</button>
                    <button class="difficulty-btn" data-difficulty="medium" data-i18n="difficulty-medium">Medium</button>
                    <button class="difficulty-btn" data-difficulty="hard" data-i18n="difficulty-hard">Hard</button>
                </div>
            </div>
            <div class="game-area" id="gameArea">
                <!-- Game-specific content goes here -->
            </div>
        `;
        
        this.setupDifficultySelector();
        this.setupGame();
        
        // Retranslate the page after adding new content
        if (typeof i18n !== 'undefined') {
            i18n.translatePage();
        }
    }
    
    setupDifficultySelector() {
        const difficultyBtns = this.container.querySelectorAll('.difficulty-btn');
        difficultyBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                difficultyBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.difficulty = btn.getAttribute('data-difficulty');
                this.onDifficultyChange();
            });
        });
    }
    
    updateScore(points) {
        this.score += points;
        document.getElementById('scoreValue').textContent = this.score;
    }
    
    updateLevel() {
        this.level++;
        document.getElementById('levelValue').textContent = this.level;
    }
    
    playSound(type) {
        MathGames.playSound(type);
    }
    
    // Problem timing for achievements
    startProblem() {
        this.problemStartTime = Date.now();
    }
    
    // Track correct answer and check achievements
    recordCorrectAnswer() {
        if (!this.gameType) return;
        
        const timeTaken = this.problemStartTime ? Date.now() - this.problemStartTime : 0;
        this.problemStartTime = null;
        
        // Record achievement
        if (typeof achievementSystem !== 'undefined') {
            const newAchievements = achievementSystem.recordCompletion(this.gameType, true, timeTaken);
            
            // Show any new achievements
            if (newAchievements && newAchievements.length > 0 && typeof achievementUI !== 'undefined') {
                newAchievements.forEach(achievement => {
                    achievementUI.showAchievement(achievement);
                });
            }
        }
    }
    
    // Track incorrect answer
    recordIncorrectAnswer() {
        if (!this.gameType) return;
        this.problemStartTime = null;
        
        if (typeof achievementSystem !== 'undefined') {
            achievementSystem.recordCompletion(this.gameType, false);
        }
    }
    
    // Override these methods in child classes
    getTitleKey() { return 'game-title'; }
    setupGame() { /* Override in child class */ }
    onDifficultyChange() { /* Override in child class */ }
    restart() { 
        this.score = 0;
        this.level = 1;
        this.createGameStructure();
    }
}

// Initialize the main application
const mathGames = new MathGames();