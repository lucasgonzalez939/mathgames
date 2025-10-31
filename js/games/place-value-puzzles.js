// Place Value Puzzles Game
class PlaceValuePuzzles extends BaseGame {
    constructor(container) {
        super(container);
        this.gameType = 'place-value-puzzles';
        this.targetNumber = 123;
        this.currentBuild = { hundreds: 0, tens: 0, ones: 0 };
        this.currentTotal = 0;
        this.maxBlocks = { hundreds: 9, tens: 20, ones: 50 }; // Reasonable limits
        this._keydownHandler = null;
    }
    
    getTitleKey() {
        return 'game-5-title';
    }
    
    setupGame() {
        const gameArea = document.getElementById('gameArea');
        gameArea.innerHTML = `
            <div class="placevalue-container">
                <div class="instructions">
                    <span data-i18n="placevalue-instructions">Build the number</span>
                    <span class="target-number" id="targetDisplay">${this.targetNumber}</span>
                </div>
                
                <div class="game-layout">
                    <div class="spawners-section">
                        <div class="spawners-title">Add Blocks:</div>
                        <div class="spawner-buttons">
                            <button class="spawner-btn hundreds-btn" id="add100Btn">
                                <div class="block-preview hundreds-block-preview"></div>
                                <span data-i18n="placevalue-add100">Add 100</span>
                            </button>
                            <button class="spawner-btn tens-btn" id="add10Btn">
                                <div class="block-preview tens-block-preview"></div>
                                <span data-i18n="placevalue-add10">Add 10</span>
                            </button>
                            <button class="spawner-btn ones-btn" id="add1Btn">
                                <div class="block-preview ones-block-preview"></div>
                                <span data-i18n="placevalue-add1">Add 1</span>
                            </button>
                        </div>
                    </div>
                    
                    <div class="build-section">
                        <div class="build-title">Your Number:</div>
                        <div class="current-total" id="currentTotal">0</div>
                        
                        <div class="build-area" id="buildArea">
                            <div class="place-value-column hundreds-column">
                                <div class="column-label" data-i18n="hundreds">Hundreds</div>
                                <div class="blocks-container" id="hundredsContainer"></div>
                                <div class="count-display">× <span id="hundredsCount">0</span></div>
                            </div>
                            
                            <div class="place-value-column tens-column">
                                <div class="column-label" data-i18n="tens">Tens</div>
                                <div class="blocks-container" id="tensContainer"></div>
                                <div class="count-display">× <span id="tensCount">0</span></div>
                            </div>
                            
                            <div class="place-value-column ones-column">
                                <div class="column-label" data-i18n="ones">Ones</div>
                                <div class="blocks-container" id="onesContainer"></div>
                                <div class="count-display">× <span id="onesCount">0</span></div>
                            </div>
                        </div>
                        
                        <div class="calculation-display">
                            <span id="calculationText">0 × 100 + 0 × 10 + 0 × 1 = 0</span>
                        </div>
                    </div>
                </div>
                
                <div class="game-controls">
                    <button class="btn btn-danger" id="resetBtn" data-i18n="placevalue-reset">Reset</button>
                    <button class="btn btn-secondary" id="hintBtn">Show Hint</button>
                </div>
                
                <div class="feedback" id="feedback"></div>
            </div>
        `;
        
        this.generateNewTarget();
        this.setupEventListeners();
        this.updateDisplay();
        
        // Retranslate after adding content
        if (typeof i18n !== 'undefined') {
            i18n.translatePage();
        }
    }
    
    generateNewTarget() {
        // Generate target based on difficulty
        switch(this.difficulty) {
            case 'easy':
                // 2-digit numbers only (tens and ones) - appropriate for 1st-2nd grade
                this.targetNumber = MathGames.randomBetween(11, 50);
                break;
            case 'medium':
                // 2-digit numbers up to 99
                this.targetNumber = MathGames.randomBetween(51, 99);
                break;
            case 'hard':
                // 3-digit numbers for advanced 2nd graders
                this.targetNumber = MathGames.randomBetween(100, 300);
                break;
        }
        
        this.resetBuild();
        this.updateDisplay();
        this.updateButtonVisibility();
        // Start timing for a new target problem
        this.startProblem();
    }
    
    resetBuild() {
        this.currentBuild = { hundreds: 0, tens: 0, ones: 0 };
        this.currentTotal = 0;
        this.renderBlocks();
        this.updateCalculation();
        this.enableSpawners();
        this.updateButtonVisibility();
    }
    
    updateButtonVisibility() {
        const add100Btn = document.getElementById('add100Btn');
        const hundredsColumn = document.querySelector('.hundreds-column');
        
        // Hide hundreds in easy and medium mode (only use tens and ones)
        if (this.difficulty === 'easy' || this.difficulty === 'medium') {
            if (add100Btn) add100Btn.style.display = 'none';
            if (hundredsColumn) hundredsColumn.style.display = 'none';
        } else {
            if (add100Btn) add100Btn.style.display = 'flex';
            if (hundredsColumn) hundredsColumn.style.display = 'flex';
        }
    }
    
    setupEventListeners() {
        const add100Btn = document.getElementById('add100Btn');
        const add10Btn = document.getElementById('add10Btn');
        const add1Btn = document.getElementById('add1Btn');
        const resetBtn = document.getElementById('resetBtn');
        const hintBtn = document.getElementById('hintBtn');
        
        add100Btn.addEventListener('click', () => this.addBlock('hundreds'));
        add10Btn.addEventListener('click', () => this.addBlock('tens'));
        add1Btn.addEventListener('click', () => this.addBlock('ones'));
        resetBtn.addEventListener('click', () => this.resetBuild());
        hintBtn.addEventListener('click', () => this.showHint());
        
        // Keyboard shortcuts
        this._keydownHandler = (e) => {
            if (e.target.tagName === 'INPUT') return; // Don't interfere with inputs
            
            switch(e.key) {
                case '1':
                    e.preventDefault();
                    this.addBlock('ones');
                    break;
                case '2':
                    e.preventDefault();
                    this.addBlock('tens');
                    break;
                case '3':
                    e.preventDefault();
                    this.addBlock('hundreds');
                    break;
                case 'r':
                case 'R':
                    e.preventDefault();
                    this.resetBuild();
                    break;
            }
        };
        document.addEventListener('keydown', this._keydownHandler);
    }
    
    addBlock(type) {
        // Check if adding this block would exceed the target
        let testTotal = this.currentTotal;
        if (type === 'hundreds') testTotal += 100;
        else if (type === 'tens') testTotal += 10;
        else if (type === 'ones') testTotal += 1;
        
        if (testTotal > this.targetNumber) {
            this.playSound('wrong');
            this.showExceedsMessage();
            return;
        }
        
        // Check block limits
        if (this.currentBuild[type] >= this.maxBlocks[type]) {
            this.playSound('wrong');
            this.showLimitMessage(type);
            return;
        }
        
        // Add the block
        this.currentBuild[type]++;
        this.calculateTotal();
        this.renderBlocks();
        this.updateCalculation();
        
        // Play sound
        this.playSound('pop');
        
        // Check if target is reached
        if (this.currentTotal === this.targetNumber) {
            this.onTargetReached();
        } else if (this.currentTotal > this.targetNumber) {
            this.onExceededTarget();
        }
    }
    
    calculateTotal() {
        this.currentTotal = (this.currentBuild.hundreds * 100) + 
                           (this.currentBuild.tens * 10) + 
                           (this.currentBuild.ones * 1);
    }
    
    updateDisplay() {
        document.getElementById('targetDisplay').textContent = this.targetNumber;
        document.getElementById('currentTotal').textContent = this.currentTotal;
        
        // Update counts
        document.getElementById('hundredsCount').textContent = this.currentBuild.hundreds;
        document.getElementById('tensCount').textContent = this.currentBuild.tens;
        document.getElementById('onesCount').textContent = this.currentBuild.ones;
    }
    
    updateCalculation() {
        const calculationText = document.getElementById('calculationText');
        calculationText.textContent = 
            `${this.currentBuild.hundreds} × 100 + ${this.currentBuild.tens} × 10 + ${this.currentBuild.ones} × 1 = ${this.currentTotal}`;
        
        this.updateDisplay();
    }
    
    renderBlocks() {
        this.renderHundredsBlocks();
        this.renderTensBlocks();
        this.renderOnesBlocks();
    }
    
    renderHundredsBlocks() {
        const container = document.getElementById('hundredsContainer');
        container.innerHTML = '';
        
        for (let i = 0; i < this.currentBuild.hundreds; i++) {
            const block = document.createElement('div');
            block.className = 'hundreds-block';
            block.innerHTML = this.createHundredsBlockContent();
            container.appendChild(block);
        }
    }
    
    renderTensBlocks() {
        const container = document.getElementById('tensContainer');
        container.innerHTML = '';
        
        for (let i = 0; i < this.currentBuild.tens; i++) {
            const block = document.createElement('div');
            block.className = 'tens-block';
            block.innerHTML = this.createTensBlockContent();
            container.appendChild(block);
        }
    }
    
    renderOnesBlocks() {
        const container = document.getElementById('onesContainer');
        container.innerHTML = '';
        
        for (let i = 0; i < this.currentBuild.ones; i++) {
            const block = document.createElement('div');
            block.className = 'ones-block';
            container.appendChild(block);
        }
    }
    
    createHundredsBlockContent() {
        // Create a 10x10 grid representing 100
        let content = '<div class="hundreds-grid">';
        for (let i = 0; i < 100; i++) {
            content += '<div class="unit-square"></div>';
        }
        content += '</div>';
        return content;
    }
    
    createTensBlockContent() {
        // Create a 1x10 rod representing 10
        let content = '<div class="tens-rod">';
        for (let i = 0; i < 10; i++) {
            content += '<div class="unit-square"></div>';
        }
        content += '</div>';
        return content;
    }
    
    onTargetReached() {
        this.playSound('success');
        this.disableSpawners();
        
        // Success animation
        const buildArea = document.getElementById('buildArea');
        buildArea.classList.add('success-glow');
        
        const perfectMsg = typeof i18n !== 'undefined' ? i18n.get('placevalue-perfect') : 'Perfect! You built';
        this.showFeedback(`🎉 ${perfectMsg} ${this.targetNumber}! 🎉`, 'success');
        
        // Award points
        this.updateScore(25 * this.level);
    // Record achievement progress for building the target
    this.recordCorrectAnswer();
        
        setTimeout(() => {
            buildArea.classList.remove('success-glow');
            if (this.score > 0 && this.score % 125 === 0) {
                this.updateLevel();
            }
            this.generateNewTarget();
        }, 3000);
    }
    
    onExceededTarget() {
        this.playSound('wrong');
        const exceededMsg = typeof i18n !== 'undefined' ? i18n.get('placevalue-exceeded') : 'Oops! You went over';
        const hintMsg = typeof i18n !== 'undefined' ? i18n.get('placevalue-exceeded-hint') : 'Use the Reset button to try again.';
        this.showFeedback(`${exceededMsg} ${this.targetNumber}. ${hintMsg}`, 'error');
        this.disableSpawners();
        // Record incorrect attempt as feedback for achievements/streaks
        this.recordIncorrectAnswer();
        
        // Flash the total red
        const currentTotal = document.getElementById('currentTotal');
        currentTotal.classList.add('exceeded');
        setTimeout(() => {
            currentTotal.classList.remove('exceeded');
        }, 1000);
    }
    
    showExceedsMessage() {
        const tooBigMsg = typeof i18n !== 'undefined' ? i18n.get('placevalue-too-big') : 'That would make the number too big! Target is';
        this.showFeedback(`${tooBigMsg} ${this.targetNumber}`, 'warning');
    }
    
    showLimitMessage(type) {
        let typeName;
        if (typeof i18n !== 'undefined') {
            typeName = type === 'hundreds' ? i18n.get('hundreds') : (type === 'tens' ? i18n.get('tens') : i18n.get('ones'));
        } else {
            typeName = type === 'hundreds' ? 'Hundreds' : (type === 'tens' ? 'Tens' : 'Ones');
        }
        const maxMsg = typeof i18n !== 'undefined' ? i18n.get('placevalue-max-blocks') : 'Maximum';
        const reachedMsg = typeof i18n !== 'undefined' ? i18n.get('placevalue-blocks-reached') : 'blocks reached!';
        this.showFeedback(`${maxMsg} ${typeName} ${reachedMsg}`, 'warning');
    }
    
    disableSpawners() {
        document.getElementById('add100Btn').disabled = true;
        document.getElementById('add10Btn').disabled = true;
        document.getElementById('add1Btn').disabled = true;
    }
    
    enableSpawners() {
        document.getElementById('add100Btn').disabled = false;
        document.getElementById('add10Btn').disabled = false;
        document.getElementById('add1Btn').disabled = false;
    }
    
    showHint() {
        const targetHundreds = Math.floor(this.targetNumber / 100);
        const targetTens = Math.floor((this.targetNumber % 100) / 10);
        const targetOnes = this.targetNumber % 10;
        
        const currentHundreds = this.currentBuild.hundreds;
        const currentTens = this.currentBuild.tens;
        const currentOnes = this.currentBuild.ones;
        
        let hint = '';
        
        if (currentHundreds < targetHundreds) {
            const needMsg = typeof i18n !== 'undefined' ? i18n.get('placevalue-hint-need-more') : 'You need';
            const moreMsg = typeof i18n !== 'undefined' ? i18n.get('placevalue-hint-more') : 'more';
            const blockMsg = typeof i18n !== 'undefined' ? i18n.get('placevalue-hint-hundred-blocks') : 'hundred block(s).';
            hint = `${needMsg} ${targetHundreds - currentHundreds} ${moreMsg} ${blockMsg}`;
        } else if (currentTens < targetTens) {
            const needMsg = typeof i18n !== 'undefined' ? i18n.get('placevalue-hint-need-more') : 'You need';
            const moreMsg = typeof i18n !== 'undefined' ? i18n.get('placevalue-hint-more') : 'more';
            const blockMsg = typeof i18n !== 'undefined' ? i18n.get('placevalue-hint-ten-blocks') : 'ten block(s).';
            hint = `${needMsg} ${targetTens - currentTens} ${moreMsg} ${blockMsg}`;
        } else if (currentOnes < targetOnes) {
            const needMsg = typeof i18n !== 'undefined' ? i18n.get('placevalue-hint-need-more') : 'You need';
            const moreMsg = typeof i18n !== 'undefined' ? i18n.get('placevalue-hint-more') : 'more';
            const blockMsg = typeof i18n !== 'undefined' ? i18n.get('placevalue-hint-one-blocks') : 'one block(s).';
            hint = `${needMsg} ${targetOnes - currentOnes} ${moreMsg} ${blockMsg}`;
        } else if (this.currentTotal === this.targetNumber) {
            hint = typeof i18n !== 'undefined' ? i18n.get('placevalue-hint-perfect') : 'Perfect! You\'ve built the target number!';
        } else {
            const hundredsLabel = typeof i18n !== 'undefined' ? i18n.get('hundreds') : 'hundreds';
            const tensLabel = typeof i18n !== 'undefined' ? i18n.get('tens') : 'tens';
            const onesLabel = typeof i18n !== 'undefined' ? i18n.get('ones') : 'ones';
            hint = `${this.targetNumber} = ${targetHundreds} ${hundredsLabel} + ${targetTens} ${tensLabel} + ${targetOnes} ${onesLabel}`;
        }
        
        this.showFeedback('💡 ' + hint, 'hint');
    }
    
    showFeedback(message, type) {
        const feedback = document.getElementById('feedback');
        feedback.className = `feedback ${type}`;
        feedback.textContent = message;
        
        setTimeout(() => {
            feedback.textContent = '';
            feedback.className = 'feedback';
        }, 4000);
    }
    
    onDifficultyChange() {
        this.generateNewTarget();
    }
    
    restart() {
        this.resetBuild();
        if (this._keydownHandler) {
            document.removeEventListener('keydown', this._keydownHandler);
            this._keydownHandler = null;
        }
        super.restart();
    }
}

// Add CSS for Place Value Puzzles
const placeValuePuzzlesCSS = `
<style>
.placevalue-container {
    max-width: 1000px;
    margin: 0 auto;
    padding: 20px;
}

.instructions {
    text-align: center;
    font-size: 1.3rem;
    margin-bottom: 2rem;
    color: var(--text-color);
}

.target-number {
    background: var(--primary-color);
    color: white;
    padding: 0.8rem 1.5rem;
    border-radius: 25px;
    font-weight: bold;
    font-size: 2rem;
    margin-left: 0.5rem;
    display: inline-block;
    min-width: 100px;
    text-align: center;
}

.game-layout {
    display: grid;
    grid-template-columns: 300px 1fr;
    gap: 2rem;
    margin-bottom: 2rem;
}

.spawners-section {
    background: var(--card-background);
    border: 3px solid var(--border-color);
    border-radius: 15px;
    padding: 1.5rem;
    box-shadow: var(--shadow);
}

.spawners-title {
    font-size: 1.3rem;
    font-weight: bold;
    color: var(--primary-color);
    margin-bottom: 1rem;
    text-align: center;
}

.spawner-buttons {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.spawner-btn {
    background: var(--card-background);
    border: 3px solid var(--border-color);
    border-radius: 15px;
    padding: 1rem;
    cursor: pointer;
    transition: all 0.3s ease;
    font-weight: bold;
    display: flex;
    align-items: center;
    gap: 1rem;
    font-size: 1rem;
}

.spawner-btn:hover {
    border-color: var(--primary-color);
    transform: translateY(-2px);
    box-shadow: var(--shadow-hover);
}

.spawner-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
}

.hundreds-btn {
    border-color: #9C27B0;
    color: #9C27B0;
}

.hundreds-btn:hover {
    background: #9C27B0;
    color: white;
}

.tens-btn {
    border-color: #2196F3;
    color: #2196F3;
}

.tens-btn:hover {
    background: #2196F3;
    color: white;
}

.ones-btn {
    border-color: #4CAF50;
    color: #4CAF50;
}

.ones-btn:hover {
    background: #4CAF50;
    color: white;
}

.block-preview {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.8rem;
    font-weight: bold;
    color: white;
}

.hundreds-block-preview {
    background: #9C27B0;
}

.tens-block-preview {
    background: #2196F3;
}

.ones-block-preview {
    background: #4CAF50;
}

.build-section {
    background: var(--card-background);
    border: 3px solid var(--border-color);
    border-radius: 15px;
    padding: 1.5rem;
    box-shadow: var(--shadow);
}

.build-section.success-glow {
    border-color: var(--success-color);
    box-shadow: 0 0 20px var(--success-color);
    animation: pulse 0.6s ease-in-out;
}

.build-title {
    font-size: 1.3rem;
    font-weight: bold;
    color: var(--primary-color);
    margin-bottom: 1rem;
    text-align: center;
}

.current-total {
    font-size: 3rem;
    font-weight: bold;
    text-align: center;
    color: var(--accent-color);
    margin-bottom: 1.5rem;
    padding: 1rem;
    background: var(--background-color);
    border-radius: 15px;
    border: 3px solid var(--border-color);
    transition: all 0.3s ease;
}

.current-total.exceeded {
    background: var(--error-color);
    color: white;
    animation: shake 0.6s ease-in-out;
}

.build-area {
    display: flex;
    justify-content: space-around;
    gap: 1rem;
    margin-bottom: 1.5rem;
}

.place-value-column {
    flex: 1;
    text-align: center;
    min-height: 200px;
}

.column-label {
    font-weight: bold;
    margin-bottom: 0.5rem;
    padding: 0.5rem;
    border-radius: 10px;
    font-size: 1.1rem;
}

.hundreds-column .column-label {
    background: #9C27B0;
    color: white;
}

.tens-column .column-label {
    background: #2196F3;
    color: white;
}

.ones-column .column-label {
    background: #4CAF50;
    color: white;
}

.blocks-container {
    min-height: 120px;
    border: 2px dashed var(--border-color);
    border-radius: 10px;
    padding: 0.5rem;
    margin-bottom: 0.5rem;
    display: flex;
    flex-wrap: wrap;
    gap: 3px;
    justify-content: center;
    align-content: flex-start;
}

.count-display {
    font-weight: bold;
    color: var(--text-color);
    font-size: 1.1rem;
}

.hundreds-block {
    width: 50px;
    height: 50px;
    background: #9C27B0;
    border-radius: 8px;
    margin: 2px;
    position: relative;
    animation: slideIn 0.3s ease-out;
}

.hundreds-grid {
    display: grid;
    grid-template-columns: repeat(10, 1fr);
    grid-template-rows: repeat(10, 1fr);
    width: 100%;
    height: 100%;
    gap: 1px;
    padding: 2px;
}

.tens-block {
    width: 40px;
    height: 20px;
    background: #2196F3;
    border-radius: 8px;
    margin: 2px;
    animation: slideIn 0.3s ease-out;
}

.tens-rod {
    display: flex;
    width: 100%;
    height: 100%;
    gap: 1px;
    padding: 2px;
}

.ones-block {
    width: 15px;
    height: 15px;
    background: #4CAF50;
    border-radius: 4px;
    margin: 1px;
    animation: slideIn 0.3s ease-out;
}

.unit-square {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 1px;
}

.calculation-display {
    background: var(--background-color);
    padding: 1rem;
    border-radius: 10px;
    text-align: center;
    font-family: 'Courier New', monospace;
    font-size: 1.1rem;
    font-weight: bold;
    color: var(--text-color);
    border: 2px solid var(--border-color);
}

@keyframes slideIn {
    from {
        transform: scale(0);
        opacity: 0;
    }
    to {
        transform: scale(1);
        opacity: 1;
    }
}

.feedback {
    text-align: center;
    padding: 1rem;
    border-radius: 15px;
    font-weight: bold;
    font-size: 1.1rem;
    margin: 1rem 0;
    min-height: 20px;
}

.feedback.success {
    background: var(--success-color);
    color: white;
    animation: bounce 0.6s ease-in-out;
}

.feedback.error {
    background: var(--error-color);
    color: white;
    animation: shake 0.6s ease-in-out;
}

.feedback.warning {
    background: var(--warning-color);
    color: white;
}

.feedback.hint {
    background: var(--accent-color);
    color: white;
}

@media (max-width: 768px) {
    .game-layout {
        grid-template-columns: 1fr;
        gap: 1.5rem;
    }
    
    .target-number {
        font-size: 1.5rem;
        padding: 0.5rem 1rem;
    }
    
    .current-total {
        font-size: 2rem;
    }
    
    .build-area {
        flex-direction: column;
        gap: 1.5rem;
    }
    
    .spawner-btn {
        padding: 0.8rem;
        font-size: 0.9rem;
    }
    
    .hundreds-block {
        width: 40px;
        height: 40px;
    }
    
    .tens-block {
        width: 30px;
        height: 15px;
    }
    
    .ones-block {
        width: 12px;
        height: 12px;
    }
}

@media (max-width: 480px) {
    .instructions {
        font-size: 1.1rem;
    }
    
    .target-number {
        font-size: 1.2rem;
        padding: 0.4rem 0.8rem;
    }
    
    .current-total {
        font-size: 1.5rem;
        padding: 0.8rem;
    }
    
    .spawner-btn {
        padding: 0.6rem;
        font-size: 0.8rem;
        gap: 0.5rem;
    }
    
    .block-preview {
        width: 30px;
        height: 30px;
    }
    
    .calculation-display {
        font-size: 0.9rem;
        padding: 0.8rem;
    }
}

/* Touch device optimizations */
@media (hover: none) and (pointer: coarse) {
    .spawner-btn {
        min-height: 60px;
        padding: 1rem;
    }
    
    .spawner-btn:hover {
        transform: none;
    }
    
    .spawner-btn:active {
        transform: scale(0.95);
    }
}
</style>
`;

// Inject CSS
document.head.insertAdjacentHTML('beforeend', placeValuePuzzlesCSS);