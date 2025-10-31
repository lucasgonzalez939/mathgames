// Math Stacker Game
class MathStacker extends BaseGame {
    constructor(container) {
        super(container);
        this.gameType = 'math-stacker';
        this.topNumber = 0;
        this.bottomNumber = 0;
        this.inputOnes = '';
        this.inputTens = '';
        this.carryValue = 0;
        this.currentColumn = 'ones';
        this.isSubtraction = false;
        this.borrowValue = 0;
        this.correctOnes = 0;
        this.correctTens = 0;
        this.needsCarry = false;
        this.needsBorrow = false;
    }
    
    getTitleKey() {
        return 'game-2-title';
    }
    
    setupGame() {
        const gameArea = document.getElementById('gameArea');
        gameArea.innerHTML = `
            <div class="mathstacker-container">
                <div class="instructions" data-i18n="mathstacker-instructions">Solve the addition step by step. Remember to carry when needed!</div>
                
                <div class="problem-stack">
                    <div class="carry-row">
                        <div class="carry-box" id="carryBox" title="Click to carry 1" aria-label="Carry one to tens">
                            <span id="carryValue"></span>
                        </div>
                    </div>
                    
                    <div class="number-row top-number">
                        <span class="tens-digit" id="topTens"></span>
                        <span class="ones-digit" id="topOnes"></span>
                    </div>
                    
                    <div class="number-row bottom-number">
                        <span class="operator" id="operator">+</span>
                        <span class="tens-digit" id="bottomTens"></span>
                        <span class="ones-digit" id="bottomOnes"></span>
                    </div>
                    
                    <div class="line"></div>
                    
                    <div class="number-row answer-row">
                        <input type="number" class="digit-input tens-input" id="tensInput" min="0" max="9" disabled>
                        <input type="number" class="digit-input ones-input" id="onesInput" min="0" max="9">
                    </div>
                </div>
                
                <div class="column-labels">
                    <span class="column-label tens-label" data-i18n="mathstacker-tens">Tens</span>
                    <span class="column-label ones-label" data-i18n="mathstacker-ones">Ones</span>
                </div>
                
                <div class="game-controls">
                    <button class="btn" id="checkBtn" disabled data-i18n="check-answer">Check Answer</button>
                    <button class="btn btn-secondary" id="hintBtn" data-i18n="show-hint">Show Hint</button>
                    <button class="btn btn-secondary" id="helpBtn" data-i18n="how-to-play">How to Play</button>
                </div>
                
                <div class="step-helper" id="stepHelper"></div>

                <div class="help-panel" id="helpPanel" hidden>
                    <div class="help-title" data-i18n="mathstacker-help-title">How to play Math Stacker</div>
                    <ul class="help-list">
                        <li data-i18n="mathstacker-help-ones">Start with the ones (right box). Type the last digit of the sum.</li>
                        <li data-i18n="mathstacker-help-carry">If the ones add to 10 or more, click the carry box to add 1 to the tens.</li>
                        <li data-i18n="mathstacker-help-tens">Then type the tens (left box). Press Enter or Check.</li>
                    </ul>
                </div>

                <div class="tower-display">
                    <div class="tower-title" data-i18n="completed-problems">Completed Problems:</div>
                    <div class="tower" id="tower"></div>
                </div>
                
                <div class="feedback" id="feedback"></div>
            </div>
        `;
        
        this.generateNewProblem();
        this.setupEventListeners();
        this.updateStepHelper();
        
        // Retranslate after adding content
        if (typeof i18n !== 'undefined') {
            i18n.translatePage();
        }
    }
    
    generateNewProblem() {
        const allowCarrying = this.difficulty !== 'easy';
        const maxNum = this.difficulty === 'easy' ? 50 : (this.difficulty === 'medium' ? 99 : 99);
        
        // Determine if it's addition or subtraction
        this.isSubtraction = this.difficulty === 'hard' && Math.random() > 0.6;
        
        if (this.isSubtraction) {
            // Generate subtraction problem
            this.topNumber = MathGames.randomBetween(20, maxNum);
            this.bottomNumber = MathGames.randomBetween(1, this.topNumber);
            
            // Check if borrowing is needed
            const topOnes = this.topNumber % 10;
            const bottomOnes = this.bottomNumber % 10;
            this.needsBorrow = topOnes < bottomOnes;
            
        } else {
            // Generate addition problem
            if (allowCarrying) {
                this.topNumber = MathGames.randomBetween(10, maxNum);
                this.bottomNumber = MathGames.randomBetween(10, maxNum);
            } else {
                // No carrying for easy mode - ensure ones don't add to 10 or more
                this.topNumber = MathGames.randomBetween(10, 40);
                let bottomOnes, bottomTens;
                do {
                    this.bottomNumber = MathGames.randomBetween(10, 50 - this.topNumber);
                    bottomOnes = this.bottomNumber % 10;
                    const topOnes = this.topNumber % 10;
                } while ((this.topNumber % 10) + (this.bottomNumber % 10) >= 10); // Ensure no carrying
            }
            
            // Check if carrying is needed
            const topOnes = this.topNumber % 10;
            const bottomOnes = this.bottomNumber % 10;
            this.needsCarry = (topOnes + bottomOnes) >= 10;
        }
        
        this.calculateCorrectAnswers();
        this.updateDisplay();
        this.resetInputs();
        // Start timing for this problem
        this.startProblem();
    }
    
    calculateCorrectAnswers() {
        const topOnes = this.topNumber % 10;
        const topTens = Math.floor(this.topNumber / 10);
        const bottomOnes = this.bottomNumber % 10;
        const bottomTens = Math.floor(this.bottomNumber / 10);
        
        if (this.isSubtraction) {
            if (this.needsBorrow) {
                this.correctOnes = (topOnes + 10) - bottomOnes;
                this.correctTens = (topTens - 1) - bottomTens;
            } else {
                this.correctOnes = topOnes - bottomOnes;
                this.correctTens = topTens - bottomTens;
            }
        } else {
            this.correctOnes = (topOnes + bottomOnes) % 10;
            if (this.needsCarry) {
                this.correctTens = topTens + bottomTens + 1;
            } else {
                this.correctTens = topTens + bottomTens;
            }
        }
    }
    
    updateDisplay() {
        const topTens = Math.floor(this.topNumber / 10);
        const topOnes = this.topNumber % 10;
        const bottomTens = Math.floor(this.bottomNumber / 10);
        const bottomOnes = this.bottomNumber % 10;
        
        document.getElementById('topTens').textContent = topTens;
        document.getElementById('topOnes').textContent = topOnes;
        document.getElementById('bottomTens').textContent = bottomTens;
        document.getElementById('bottomOnes').textContent = bottomOnes;
        document.getElementById('operator').textContent = this.isSubtraction ? '-' : '+';
        
        // Update carry box visibility
        const carryBox = document.getElementById('carryBox');
        carryBox.style.display = this.isSubtraction ? 'none' : 'block';
        
        // Reset carry/borrow values
        this.carryValue = 0;
        this.borrowValue = 0;
        document.getElementById('carryValue').textContent = '';
    }
    
    resetInputs() {
        this.inputOnes = '';
        this.inputTens = '';
        this.currentColumn = 'ones';
        this.carryValue = 0;
        this.borrowValue = 0;
        
        const onesInput = document.getElementById('onesInput');
        const tensInput = document.getElementById('tensInput');
        const checkBtn = document.getElementById('checkBtn');
        
        onesInput.value = '';
        tensInput.value = '';
        onesInput.disabled = false;
        tensInput.disabled = true;
        onesInput.focus();
        
        checkBtn.disabled = true;
        
        // Reset visual states
        document.querySelectorAll('.digit-input').forEach(input => {
            input.classList.remove('correct', 'wrong', 'locked');
        });
    }
    
    setupEventListeners() {
        const onesInput = document.getElementById('onesInput');
        const tensInput = document.getElementById('tensInput');
        const carryBox = document.getElementById('carryBox');
        const checkBtn = document.getElementById('checkBtn');
        const hintBtn = document.getElementById('hintBtn');
        const helpBtn = document.getElementById('helpBtn');
        const helpPanel = document.getElementById('helpPanel');
        
        // Ones input handling
        onesInput.addEventListener('input', (e) => {
            this.inputOnes = e.target.value;
            this.validateOnesInput();
            this.updateStepHelper();
        });
        
        onesInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && this.inputOnes) {
                this.commitOnesAnswer();
            }
        });
        
        // Tens input handling
        tensInput.addEventListener('input', (e) => {
            this.inputTens = e.target.value;
            this.enableCheckButton();
            this.updateStepHelper();
        });
        
        tensInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && this.inputTens) {
                this.checkFinalAnswer();
            }
        });
        
        // Carry box handling
        carryBox.addEventListener('click', () => {
            if (!this.isSubtraction && this.currentColumn === 'ones') {
                this.carryValue = this.carryValue === 1 ? 0 : 1;
                document.getElementById('carryValue').textContent = this.carryValue || '';
                carryBox.classList.toggle('active', this.carryValue === 1);
            }
        });
        
        // Check button
        checkBtn.addEventListener('click', () => {
            this.checkFinalAnswer();
        });
        
        // Hint button
        hintBtn.addEventListener('click', () => {
            this.showHint();
        });

        // Help button toggle
        helpBtn.addEventListener('click', () => {
            const isHidden = helpPanel.hasAttribute('hidden');
            if (isHidden) {
                helpPanel.removeAttribute('hidden');
                helpBtn.classList.add('active');
                helpBtn.setAttribute('aria-expanded', 'true');
            } else {
                helpPanel.setAttribute('hidden', '');
                helpBtn.classList.remove('active');
                helpBtn.setAttribute('aria-expanded', 'false');
            }
        });
    }
    
    validateOnesInput() {
        const value = parseInt(this.inputOnes);
        if (!isNaN(value) && value >= 0 && value <= 9) {
            // Enable commit when ones is entered
            setTimeout(() => this.commitOnesAnswer(), 500);
        }
    }
    
    commitOnesAnswer() {
        const onesValue = parseInt(this.inputOnes);
        const carryNeeded = this.isSubtraction ? this.needsBorrow : this.needsCarry;
        const carryCorrect = this.isSubtraction ? true : (this.carryValue === (carryNeeded ? 1 : 0));
        
        if (onesValue === this.correctOnes && carryCorrect) {
            // Correct ones answer
            this.playSound('correct');
            const onesInput = document.getElementById('onesInput');
            onesInput.classList.add('correct', 'locked');
            onesInput.disabled = true;
            
            // Move to tens column
            this.currentColumn = 'tens';
            const tensInput = document.getElementById('tensInput');
            tensInput.disabled = false;
            tensInput.focus();
            this.updateStepHelper();
            
        } else {
            // Wrong answer
            this.playSound('wrong');
            const onesInput = document.getElementById('onesInput');
            onesInput.classList.add('wrong');
            onesInput.value = '';
            this.inputOnes = '';
            this.carryValue = 0;
            document.getElementById('carryValue').textContent = '';
            document.getElementById('carryBox').classList.remove('active');
            
            setTimeout(() => {
                onesInput.classList.remove('wrong');
                onesInput.focus();
                this.updateStepHelper();
            }, 600);
        }
    }
    
    enableCheckButton() {
        const checkBtn = document.getElementById('checkBtn');
        checkBtn.disabled = !this.inputTens;
    }

    updateStepHelper() {
        const helper = document.getElementById('stepHelper');
        if (!helper) return;
        const topOnes = this.topNumber % 10;
        const bottomOnes = this.bottomNumber % 10;
        const carryNeeded = !this.isSubtraction && (topOnes + bottomOnes) >= 10;
        if (this.currentColumn === 'ones') {
            helper.innerHTML = `
                <span class="badge" data-i18n="step-1">Step 1</span>
                ${i18n.get('addition')}: <strong>${topOnes} + ${bottomOnes}</strong>
                ${carryNeeded ? ' — 10 or more: click the carry box (1)' : ''}
            `;
            this.highlightColumn('ones');
        } else {
            const topTens = Math.floor(this.topNumber / 10);
            const bottomTens = Math.floor(this.bottomNumber / 10);
            const carryText = (!this.isSubtraction && this.needsCarry) ? ` + 1 (${i18n.get('hint-carried')})` : '';
            helper.innerHTML = `
                <span class="badge" data-i18n="step-2">Step 2</span>
                ${i18n.get('addition')}: <strong>${topTens} + ${bottomTens}${carryText}</strong>
            `;
            this.highlightColumn('tens');
        }
    }

    highlightColumn(which) {
        const onesInput = document.getElementById('onesInput');
        const tensInput = document.getElementById('tensInput');
        const onesLabel = this.container.querySelector('.ones-label');
        const tensLabel = this.container.querySelector('.tens-label');
        [onesInput, tensInput, onesLabel, tensLabel].forEach(el => el && el.classList.remove('active-col'));
        if (which === 'ones') {
            onesInput && onesInput.classList.add('active-col');
            onesLabel && onesLabel.classList.add('active-col');
        } else {
            tensInput && tensInput.classList.add('active-col');
            tensLabel && tensLabel.classList.add('active-col');
        }
        // Indicate carry box when relevant
        const carryBox = document.getElementById('carryBox');
        const topOnes = this.topNumber % 10;
        const bottomOnes = this.bottomNumber % 10;
        const shouldCarry = !this.isSubtraction && (topOnes + bottomOnes) >= 10 && which === 'ones';
        carryBox && carryBox.classList.toggle('hint-glow', shouldCarry);
    }
    
    checkFinalAnswer() {
        const tensValue = parseInt(this.inputTens);
        
        if (tensValue === this.correctTens) {
            // Correct final answer!
            this.playSound('success');
            const tensInput = document.getElementById('tensInput');
            tensInput.classList.add('correct');
            
            this.showSuccess();
            this.updateScore(20 * this.level);
            this.addToTower();
            // Record achievement progress
            this.recordCorrectAnswer();
            
            setTimeout(() => {
                if (this.score > 0 && this.score % 100 === 0) {
                    this.updateLevel();
                }
                this.generateNewProblem();
            }, 2000);
            
        } else {
            // Wrong tens answer
            this.playSound('wrong');
            const tensInput = document.getElementById('tensInput');
            tensInput.classList.add('wrong');
            tensInput.value = '';
            this.inputTens = '';
            // Record incorrect attempt for this problem
            this.recordIncorrectAnswer();
            
            setTimeout(() => {
                tensInput.classList.remove('wrong');
                tensInput.focus();
            }, 600);
        }
    }
    
    showSuccess() {
        const feedback = document.getElementById('feedback');
        feedback.innerHTML = `
            <div class="success-message">
                <div class="celebration">🎉</div>
                <div data-i18n="correct">Correct!</div>
                <div class="problem-summary">${this.topNumber} ${this.isSubtraction ? '-' : '+'} ${this.bottomNumber} = ${this.topNumber + (this.isSubtraction ? -this.bottomNumber : this.bottomNumber)}</div>
            </div>
        `;
        
        setTimeout(() => {
            feedback.innerHTML = '';
        }, 2000);
        
        // Retranslate
        if (typeof i18n !== 'undefined') {
            i18n.translatePage();
        }
    }
    
    addToTower() {
        const tower = document.getElementById('tower');
        const block = document.createElement('div');
        block.className = 'tower-block';
        block.textContent = `${this.topNumber} ${this.isSubtraction ? '-' : '+'} ${this.bottomNumber}`;
        
        // Add block to top of tower
        if (tower.firstChild) {
            tower.insertBefore(block, tower.firstChild);
        } else {
            tower.appendChild(block);
        }
        
        // Keep only last 5 blocks visible
        const blocks = tower.querySelectorAll('.tower-block');
        if (blocks.length > 5) {
            tower.removeChild(blocks[blocks.length - 1]);
        }
    }
    
    showHint() {
        const feedback = document.getElementById('feedback');
        let hintText = '';
        
        if (this.currentColumn === 'ones') {
            const topOnes = this.topNumber % 10;
            const bottomOnes = this.bottomNumber % 10;
            
            if (this.isSubtraction) {
                if (this.needsBorrow) {
                    hintText = `${i18n.get('hint-since-borrow-prefix')} ${topOnes} < ${bottomOnes}, ${i18n.get('hint-borrow-tens')} ${topOnes} + 10 - ${bottomOnes} = ${this.correctOnes}`;
                } else {
                    hintText = `${topOnes} - ${bottomOnes} = ${this.correctOnes}`;
                }
            } else {
                hintText = `${topOnes} + ${bottomOnes} = ${topOnes + bottomOnes}`;
                if (this.needsCarry) {
                    hintText += `. ${i18n.get('hint-since-gte-10')} ${this.correctOnes} ${i18n.get('hint-and-carry-1')}`;
                }
            }
        } else {
            const topTens = Math.floor(this.topNumber / 10);
            const bottomTens = Math.floor(this.bottomNumber / 10);
            
            if (this.isSubtraction) {
                if (this.needsBorrow) {
                    hintText = `${i18n.get('hint-after-borrowing')} (${topTens} - 1) - ${bottomTens} = ${this.correctTens}`;
                } else {
                    hintText = `${topTens} - ${bottomTens} = ${this.correctTens}`;
                }
            } else {
                if (this.needsCarry) {
                    hintText = `${topTens} + ${bottomTens} + 1 (${i18n.get('hint-carried')}) = ${this.correctTens}`;
                } else {
                    hintText = `${topTens} + ${bottomTens} = ${this.correctTens}`;
                }
            }
        }
        
        feedback.innerHTML = `<div class="hint-message">💡 ${hintText}</div>`;
        
        setTimeout(() => {
            feedback.innerHTML = '';
        }, 4000);
    }
    
    onDifficultyChange() {
        this.generateNewProblem();
    }
    
    restart() {
        document.getElementById('tower').innerHTML = '';
        super.restart();
    }
}

// Add CSS for Math Stacker
const mathStackerCSS = `
<style>
.mathstacker-container {
    text-align: center;
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
}

.step-helper {
    margin: 1rem auto;
    background: var(--background-color);
    border: 2px solid var(--border-color);
    border-radius: 12px;
    padding: 0.8rem 1rem;
    max-width: 600px;
    font-weight: 600;
}

.step-helper .badge {
    display: inline-block;
    background: var(--primary-color);
    color: white;
    border-radius: 10px;
    padding: 2px 8px;
    margin-right: 8px;
    font-size: 0.85rem;
}

.help-panel {
    background: var(--card-background);
    border: 2px solid var(--border-color);
    border-radius: 12px;
    padding: 1rem 1.2rem;
    margin: 0.5rem auto 1rem;
    max-width: 600px;
    text-align: left;
}

.help-title {
    font-weight: bold;
    color: var(--primary-color);
    margin-bottom: 0.5rem;
}

.help-list {
    padding-left: 1.2rem;
}

.help-list li {
    margin: 0.3rem 0;
}

.active-col {
    box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.25) inset;
    border-color: var(--primary-color) !important;
}

.carry-box.hint-glow {
    animation: carryGlow 1s ease-in-out infinite;
}

@keyframes carryGlow {
    0% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.6); }
    70% { box-shadow: 0 0 0 10px rgba(76, 175, 80, 0); }
    100% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0); }
}

.instructions {
    font-size: 1.2rem;
    color: var(--text-light);
    margin-bottom: 2rem;
}

.problem-stack {
    background: var(--card-background);
    border: 3px solid var(--border-color);
    border-radius: 15px;
    padding: 2rem;
    margin: 2rem auto;
    display: inline-block;
    font-family: 'Courier New', monospace;
    font-size: 2rem;
    box-shadow: var(--shadow);
}

.carry-row {
    height: 50px;
    position: relative;
    margin-bottom: 10px;
}

.carry-box {
    position: absolute;
    right: 20px;
    top: 0;
    width: 40px;
    height: 40px;
    border: 2px dashed var(--accent-color);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
    background: var(--background-color);
}

.carry-box:hover {
    background: var(--accent-color);
    color: white;
}

.carry-box.active {
    background: var(--accent-color);
    color: white;
    border-style: solid;
}

.number-row {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    margin: 10px 0;
    min-height: 60px;
}

.operator {
    margin-right: 20px;
    width: 30px;
    text-align: center;
    font-weight: bold;
    color: var(--primary-color);
}

.tens-digit, .ones-digit {
    width: 50px;
    text-align: center;
    margin: 0 5px;
    font-weight: bold;
}

.line {
    height: 3px;
    background: var(--text-color);
    margin: 10px 0;
}

.digit-input {
    width: 50px;
    height: 50px;
    text-align: center;
    font-size: 2rem;
    font-family: 'Courier New', monospace;
    border: 2px solid var(--border-color);
    border-radius: 8px;
    margin: 0 5px;
    background: var(--background-color);
    transition: all 0.3s ease;
}

.digit-input:focus {
    border-color: var(--primary-color);
    outline: none;
    box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.2);
}

.digit-input:disabled {
    background: var(--border-color);
    cursor: not-allowed;
}

.digit-input.correct {
    background: var(--success-color);
    color: white;
    border-color: var(--success-color);
}

.digit-input.wrong {
    background: var(--error-color);
    color: white;
    border-color: var(--error-color);
    animation: shake 0.6s ease-in-out;
}

.digit-input.locked {
    background: var(--success-color);
    color: white;
    cursor: not-allowed;
}

.column-labels {
    display: flex;
    justify-content: center;
    gap: 2rem;
    margin-bottom: 2rem;
    font-weight: bold;
    color: var(--text-light);
}

.column-label {
    padding: 0.5rem 1rem;
    background: var(--background-color);
    border-radius: 15px;
    border: 2px solid var(--border-color);
}

.tower-display {
    margin: 2rem 0;
    text-align: center;
}

.tower-title {
    font-weight: bold;
    margin-bottom: 1rem;
    color: var(--primary-color);
}

.tower {
    min-height: 100px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
}

.tower-block {
    background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
    color: white;
    padding: 8px 16px;
    border-radius: 10px;
    font-weight: bold;
    font-size: 0.9rem;
    min-width: 120px;
    box-shadow: var(--shadow);
    animation: slideDown 0.5s ease-out;
}

@keyframes slideDown {
    from {
        transform: translateY(-20px);
        opacity: 0;
    }
    to {
        transform: translateY(0);
        opacity: 1;
    }
}

.success-message {
    background: var(--success-color);
    color: white;
    padding: 1.5rem;
    border-radius: 15px;
    margin: 1rem 0;
    font-weight: bold;
    animation: bounce 0.6s ease-in-out;
}

.celebration {
    font-size: 2rem;
    margin-bottom: 0.5rem;
}

.problem-summary {
    font-size: 1.1rem;
    margin-top: 0.5rem;
    font-family: 'Courier New', monospace;
}

.hint-message {
    background: var(--accent-color);
    color: white;
    padding: 1rem;
    border-radius: 15px;
    margin: 1rem 0;
    font-size: 1rem;
    animation: fadeIn 0.5s ease-in-out;
}

@media (max-width: 768px) {
    .problem-stack {
        font-size: 1.5rem;
        padding: 1.5rem;
    }
    
    .digit-input {
        width: 40px;
        height: 40px;
        font-size: 1.5rem;
    }
    
    .carry-box {
        width: 30px;
        height: 30px;
        right: 15px;
    }
    
    .tens-digit, .ones-digit {
        width: 40px;
    }
    
    .column-labels {
        gap: 1rem;
    }
}

@media (max-width: 480px) {
    .problem-stack {
        font-size: 1.2rem;
        padding: 1rem;
    }
    
    .digit-input {
        width: 35px;
        height: 35px;
        font-size: 1.2rem;
    }
    
    .instructions {
        font-size: 1rem;
    }
}
</style>
`;

// Inject CSS
document.head.insertAdjacentHTML('beforeend', mathStackerCSS);