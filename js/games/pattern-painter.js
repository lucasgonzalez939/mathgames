// Pattern Painter Game
class PatternPainter extends BaseGame {
    constructor(container) {
        super(container);
        this.gameType = 'pattern-painter';
        this.currentPattern = [];
        this.patternRule = null;
        this.nextInSequence = null;
        this.answerOptions = [];
        this.patternType = 'number';
        this.consecutiveCorrect = 0;
        this._keydownHandler = null;
    }
    
    getTitleKey() {
        return 'game-7-title';
    }
    
    setupGame() {
        const gameArea = document.getElementById('gameArea');
        gameArea.innerHTML = `
            <div class="pattern-container">
                <div class="instructions" data-i18n="pattern-instructions">What comes next in the pattern?</div>
                
                <div class="pattern-type-selector">
                    <button class="pattern-type-btn active" data-type="number" id="numberPatternBtn">
                        <span class="type-icon">🔢</span>
                        <span data-i18n="numbers">Numbers</span>
                    </button>
                    <button class="pattern-type-btn" data-type="color" id="colorPatternBtn">
                        <span class="type-icon">🎨</span>
                        <span data-i18n="colors">Colors</span>
                    </button>
                    <button class="pattern-type-btn" data-type="shape" id="shapePatternBtn">
                        <span class="type-icon">⭐</span>
                        <span data-i18n="shapes">Shapes</span>
                    </button>
                </div>
                
                <div class="pattern-display" id="patternDisplay">
                    <div class="pattern-sequence" id="patternSequence">
                        <!-- Pattern blocks will appear here -->
                    </div>
                    <div class="next-block mystery-block" id="nextBlock">
                        <span class="mystery-symbol">?</span>
                    </div>
                </div>
                
                <div class="pattern-rule-hint" id="ruleHint" style="display: none;">
                    <!-- Pattern rule hint will appear here -->
                </div>
                
                <div class="answer-options" id="answerOptions">
                    <!-- Answer choices will appear here -->
                </div>
                
                <div class="game-controls">
                    <button class="btn btn-secondary" id="hintBtn">Show Hint</button>
                    <button class="btn btn-secondary" id="newPatternBtn">New Pattern</button>
                </div>
                
                <div class="streak-display">
                    <span data-i18n="streak">Streak</span>: <span id="streakCount">${this.consecutiveCorrect}</span>
                </div>
                
                <div class="feedback" id="feedback"></div>
            </div>
        `;
        
        this.setupEventListeners();
        this.generateNewPattern();
        
        // Retranslate after adding content
        if (typeof i18n !== 'undefined') {
            i18n.translatePage();
        }
    }
    
    setupEventListeners() {
        // Pattern type selectors
        document.querySelectorAll('.pattern-type-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const newType = e.currentTarget.getAttribute('data-type');
                this.changePatternType(newType);
            });
        });
        
        // Control buttons
        document.getElementById('hintBtn').addEventListener('click', () => this.showHint());
        document.getElementById('newPatternBtn').addEventListener('click', () => this.generateNewPattern());
        
        // Keyboard support
        this._keydownHandler = (e) => {
            if (e.target.tagName === 'INPUT') return;
            
            // Number keys 1-4 for answer selection
            if (e.key >= '1' && e.key <= '4') {
                e.preventDefault();
                const optionIndex = parseInt(e.key) - 1;
                const options = document.querySelectorAll('.answer-option');
                if (options[optionIndex]) {
                    options[optionIndex].click();
                }
            }
        };
        document.addEventListener('keydown', this._keydownHandler);
    }
    
    changePatternType(newType) {
        this.patternType = newType;
        
        // Update active button
        document.querySelectorAll('.pattern-type-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-type="${newType}"]`).classList.add('active');
        
        // Generate new pattern of the selected type
        this.generateNewPattern();
    }
    
    generateNewPattern() {
        switch(this.patternType) {
            case 'number':
                this.generateNumberPattern();
                break;
            case 'color':
                this.generateColorPattern();
                break;
            case 'shape':
                this.generateShapePattern();
                break;
        }
        
        this.generateAnswerOptions();
        this.renderPattern();
        this.hideHint();
        // Start timing for this pattern as a problem
        this.startProblem();
    }
    
    generateNumberPattern() {
        const patternTypes = this.getNumberPatternTypes();
        const selectedType = patternTypes[Math.floor(Math.random() * patternTypes.length)];
        
        this.patternRule = selectedType;
        
        switch(selectedType.type) {
            case 'addition':
                this.generateAdditionPattern(selectedType.step);
                break;
            case 'subtraction':
                this.generateSubtractionPattern(selectedType.step);
                break;
            case 'multiplication':
                this.generateMultiplicationPattern(selectedType.factor);
                break;
            case 'fibonacci':
                this.generateFibonacciPattern();
                break;
            case 'alternating':
                this.generateAlternatingPattern();
                break;
        }
    }
    
    getNumberPatternTypes() {
        const types = [];
        
        switch(this.difficulty) {
            case 'easy':
                types.push(
                    { type: 'addition', step: 1 },
                    { type: 'addition', step: 2 },
                    { type: 'addition', step: 5 },
                    { type: 'subtraction', step: 1 },
                    { type: 'subtraction', step: 2 }
                );
                break;
            case 'medium':
                types.push(
                    { type: 'addition', step: 3 },
                    { type: 'addition', step: 4 },
                    { type: 'addition', step: 10 },
                    { type: 'subtraction', step: 3 },
                    { type: 'multiplication', factor: 2 },
                    { type: 'alternating' }
                );
                break;
            case 'hard':
                types.push(
                    { type: 'addition', step: 6 },
                    { type: 'addition', step: 7 },
                    { type: 'addition', step: 8 },
                    { type: 'multiplication', factor: 3 },
                    { type: 'fibonacci' },
                    { type: 'alternating' }
                );
                break;
        }
        
        return types;
    }
    
    generateAdditionPattern(step) {
        const start = MathGames.randomBetween(1, 10);
        this.currentPattern = [];
        
        for (let i = 0; i < 4; i++) {
            this.currentPattern.push(start + (i * step));
        }
        
        this.nextInSequence = start + (4 * step);
    }
    
    generateSubtractionPattern(step) {
        const start = MathGames.randomBetween(20, 50);
        this.currentPattern = [];
        
        for (let i = 0; i < 4; i++) {
            this.currentPattern.push(start - (i * step));
        }
        
        this.nextInSequence = start - (4 * step);
    }
    
    generateMultiplicationPattern(factor) {
        const start = MathGames.randomBetween(1, 5);
        this.currentPattern = [];
        
        for (let i = 0; i < 4; i++) {
            this.currentPattern.push(start * Math.pow(factor, i));
        }
        
        this.nextInSequence = start * Math.pow(factor, 4);
    }
    
    generateFibonacciPattern() {
        this.currentPattern = [1, 1, 2, 3];
        this.nextInSequence = 5;
    }
    
    generateAlternatingPattern() {
        const even = MathGames.randomBetween(2, 20);
        const odd = even + 1;
        this.currentPattern = [even, odd, even, odd];
        this.nextInSequence = even;
    }
    
    generateColorPattern() {
        const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];
        const patternLength = this.difficulty === 'easy' ? 2 : (this.difficulty === 'medium' ? 3 : 4);
        
        // Create base pattern
        const basePattern = [];
        for (let i = 0; i < patternLength; i++) {
            basePattern.push(colors[i % colors.length]);
        }
        
        // Repeat pattern
        this.currentPattern = [];
        const cycles = this.difficulty === 'easy' ? 2 : (this.difficulty === 'medium' ? 1.5 : 1);
        const totalLength = Math.floor(patternLength * cycles);
        
        for (let i = 0; i < totalLength; i++) {
            this.currentPattern.push(basePattern[i % patternLength]);
        }
        
        this.nextInSequence = basePattern[totalLength % patternLength];
        this.patternRule = { type: 'color', pattern: basePattern };
    }
    
    generateShapePattern() {
        const shapes = ['circle', 'square', 'triangle', 'star', 'heart', 'diamond'];
        const patternLength = this.difficulty === 'easy' ? 2 : (this.difficulty === 'medium' ? 3 : 4);
        
        // Create base pattern
        const basePattern = [];
        for (let i = 0; i < patternLength; i++) {
            basePattern.push(shapes[i % shapes.length]);
        }
        
        // Repeat pattern
        this.currentPattern = [];
        const cycles = this.difficulty === 'easy' ? 2 : 1.5;
        const totalLength = Math.floor(patternLength * cycles);
        
        for (let i = 0; i < totalLength; i++) {
            this.currentPattern.push(basePattern[i % patternLength]);
        }
        
        this.nextInSequence = basePattern[totalLength % patternLength];
        this.patternRule = { type: 'shape', pattern: basePattern };
    }
    
    generateAnswerOptions() {
        this.answerOptions = [this.nextInSequence];
        
        // Generate distractors based on pattern type
        while (this.answerOptions.length < 4) {
            let distractor;
            
            if (this.patternType === 'number') {
                if (typeof this.nextInSequence === 'number') {
                    distractor = this.nextInSequence + MathGames.randomBetween(-5, 5);
                    if (distractor <= 0) distractor = this.nextInSequence + MathGames.randomBetween(1, 5);
                }
            } else if (this.patternType === 'color') {
                const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];
                distractor = colors[Math.floor(Math.random() * colors.length)];
            } else if (this.patternType === 'shape') {
                const shapes = ['circle', 'square', 'triangle', 'star', 'heart', 'diamond'];
                distractor = shapes[Math.floor(Math.random() * shapes.length)];
            }
            
            if (distractor && !this.answerOptions.includes(distractor)) {
                this.answerOptions.push(distractor);
            }
        }
        
        // Shuffle options
        this.answerOptions = MathGames.shuffleArray(this.answerOptions);
    }
    
    renderPattern() {
        this.renderPatternSequence();
        this.renderAnswerOptions();
        this.updateStreakDisplay();
    }
    
    renderPatternSequence() {
        const container = document.getElementById('patternSequence');
        container.innerHTML = '';
        
        this.currentPattern.forEach((item, index) => {
            const block = document.createElement('div');
            block.className = 'pattern-block';
            block.innerHTML = this.getBlockContent(item);
            
            // Add entrance animation with delay
            setTimeout(() => {
                block.classList.add('animate-in');
            }, index * 200);
            
            container.appendChild(block);
        });
    }
    
    getBlockContent(item) {
        if (this.patternType === 'number') {
            return `<span class="block-number">${item}</span>`;
        } else if (this.patternType === 'color') {
            return `<div class="color-block ${item}"></div>`;
        } else if (this.patternType === 'shape') {
            const shapeEmojis = {
                circle: '⭕',
                square: '⬜',
                triangle: '🔺',
                star: '⭐',
                heart: '❤️',
                diamond: '💎'
            };
            return `<span class="shape-emoji">${shapeEmojis[item] || '⭕'}</span>`;
        }
    }
    
    renderAnswerOptions() {
        const container = document.getElementById('answerOptions');
        container.innerHTML = '';
        
        this.answerOptions.forEach((option, index) => {
            const optionBtn = document.createElement('button');
            optionBtn.className = 'answer-option';
            // Store the logical value for strict comparison later
            optionBtn.setAttribute('data-value', typeof option === 'number' ? option.toString() : option);
            optionBtn.innerHTML = `
                <div class="option-content">${this.getBlockContent(option)}</div>
                <div class="option-number">${index + 1}</div>
            `;
            
            optionBtn.addEventListener('click', () => this.selectAnswer(option));
            
            // Add entrance animation
            setTimeout(() => {
                optionBtn.classList.add('animate-in');
            }, (this.currentPattern.length + index) * 200);
            
            container.appendChild(optionBtn);
        });
    }
    
    selectAnswer(selectedOption) {
        if (selectedOption === this.nextInSequence) {
            this.onCorrectAnswer(selectedOption);
        } else {
            this.onWrongAnswer(selectedOption);
        }
    }
    
    onCorrectAnswer(selectedOption) {
        this.playSound('success');
        this.consecutiveCorrect++;
        
        // Update mystery block with correct answer
        const nextBlock = document.getElementById('nextBlock');
        nextBlock.innerHTML = this.getBlockContent(selectedOption);
        nextBlock.classList.add('correct-reveal');
        
        // Highlight correct option
        document.querySelectorAll('.answer-option').forEach(btn => {
            const val = btn.getAttribute('data-value');
            const isMatch = (typeof selectedOption === 'number')
                ? val === selectedOption.toString()
                : val === selectedOption;
            if (isMatch) {
                btn.classList.add('correct');
            } else {
                btn.classList.add('faded');
            }
            btn.disabled = true;
        });
        
        // Show success feedback
        this.showFeedback('🎉 ' + i18n.get('pattern-continue'), 'success');
        
        // Award points
        this.updateScore(20 * this.level * (this.consecutiveCorrect > 3 ? 2 : 1));
        // Record achievement progress
        this.recordCorrectAnswer();
        
        // Extend pattern or generate new one
        setTimeout(() => {
            if (this.consecutiveCorrect % 3 === 0) {
                // Generate completely new pattern every 3 correct answers
                if (this.score > 0 && this.score % 100 === 0) {
                    this.updateLevel();
                }
                this.generateNewPattern();
            } else {
                // Extend current pattern
                this.extendPattern();
            }
        }, 2000);
    }
    
    onWrongAnswer(selectedOption) {
        this.playSound('wrong');
        this.consecutiveCorrect = 0;
        
        // Highlight wrong option and correct option
        document.querySelectorAll('.answer-option').forEach(btn => {
            const val = btn.getAttribute('data-value');
            const isSelected = (typeof selectedOption === 'number') ? val === selectedOption.toString() : val === selectedOption;
            const isCorrect = (typeof this.nextInSequence === 'number') ? val === this.nextInSequence.toString() : val === this.nextInSequence;
            if (isSelected) {
                btn.classList.add('wrong');
            } else if (isCorrect) {
                btn.classList.add('correct');
            } else {
                btn.classList.add('faded');
            }
            btn.disabled = true;
        });
        
        // Show correct answer in mystery block
        const nextBlock = document.getElementById('nextBlock');
        nextBlock.innerHTML = this.getBlockContent(this.nextInSequence);
        nextBlock.classList.add('wrong-reveal');
        
        this.showFeedback('❌ ' + i18n.get('try-again'), 'error');
        // Record incorrect attempt
        this.recordIncorrectAnswer();
        
        setTimeout(() => {
            this.generateNewPattern();
        }, 2500);
    }
    
    extendPattern() {
        // Add the correct answer to the pattern
        this.currentPattern.push(this.nextInSequence);
        
        // Generate next item in sequence
        if (this.patternType === 'number') {
            this.extendNumberPattern();
        } else {
            this.extendRepeatingPattern();
        }
        
        this.generateAnswerOptions();
        this.renderPattern();
        this.hideHint();
    }
    
    extendNumberPattern() {
        if (this.patternRule.type === 'addition') {
            this.nextInSequence += this.patternRule.step;
        } else if (this.patternRule.type === 'subtraction') {
            this.nextInSequence -= this.patternRule.step;
        } else if (this.patternRule.type === 'multiplication') {
            this.nextInSequence *= this.patternRule.factor;
        } else if (this.patternRule.type === 'fibonacci') {
            const last = this.currentPattern[this.currentPattern.length - 1];
            const secondLast = this.currentPattern[this.currentPattern.length - 2];
            this.nextInSequence = last + secondLast;
        } else if (this.patternRule.type === 'alternating') {
            // Alternate between the two values
            const current = this.currentPattern[this.currentPattern.length - 1];
            const prev = this.currentPattern[this.currentPattern.length - 2];
            this.nextInSequence = this.nextInSequence === current ? prev : current;
        }
    }
    
    extendRepeatingPattern() {
        const patternLength = this.patternRule.pattern.length;
        const position = this.currentPattern.length % patternLength;
        this.nextInSequence = this.patternRule.pattern[position];
    }
    
    showHint() {
        const ruleHint = document.getElementById('ruleHint');
        let hintText = '';
        
        if (this.patternType === 'number') {
            if (this.patternRule.type === 'addition') {
                hintText = `Each number increases by ${this.patternRule.step}`;
            } else if (this.patternRule.type === 'subtraction') {
                hintText = `Each number decreases by ${this.patternRule.step}`;
            } else if (this.patternRule.type === 'multiplication') {
                hintText = `Each number is multiplied by ${this.patternRule.factor}`;
            } else if (this.patternRule.type === 'fibonacci') {
                hintText = 'Each number is the sum of the two numbers before it';
            } else if (this.patternRule.type === 'alternating') {
                hintText = 'The pattern alternates between two numbers';
            }
        } else if (this.patternType === 'color') {
            hintText = `The colors repeat in this pattern: ${this.patternRule.pattern.join(', ')}`;
        } else if (this.patternType === 'shape') {
            hintText = `The shapes repeat in this pattern: ${this.patternRule.pattern.join(', ')}`;
        }
        
        ruleHint.innerHTML = `<div class="hint-content">💡 ${hintText}</div>`;
        ruleHint.style.display = 'block';
        ruleHint.classList.add('animate-in');
    }
    
    hideHint() {
        const ruleHint = document.getElementById('ruleHint');
        ruleHint.style.display = 'none';
        ruleHint.classList.remove('animate-in');
    }
    
    updateStreakDisplay() {
        document.getElementById('streakCount').textContent = this.consecutiveCorrect;
    }
    
    showFeedback(message, type) {
        const feedback = document.getElementById('feedback');
        feedback.className = `feedback ${type}`;
        feedback.textContent = message;
        
        setTimeout(() => {
            feedback.textContent = '';
            feedback.className = 'feedback';
        }, 2000);
    }
    
    onDifficultyChange() {
        this.consecutiveCorrect = 0;
        this.generateNewPattern();
    }
    
    restart() {
        this.consecutiveCorrect = 0;
        if (this._keydownHandler) {
            document.removeEventListener('keydown', this._keydownHandler);
            this._keydownHandler = null;
        }
        super.restart();
    }
}

// Add CSS for Pattern Painter
const patternPainterCSS = `
<style>
.pattern-container {
    max-width: 1000px;
    margin: 0 auto;
    padding: 20px;
    text-align: center;
}

.instructions {
    font-size: 1.3rem;
    margin-bottom: 2rem;
    color: var(--text-color);
}

.pattern-type-selector {
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin-bottom: 2rem;
    flex-wrap: wrap;
}

.pattern-type-btn {
    background: var(--card-background);
    border: 3px solid var(--border-color);
    border-radius: 15px;
    padding: 1rem 1.5rem;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    min-width: 100px;
}

.pattern-type-btn:hover {
    border-color: var(--primary-color);
    transform: translateY(-2px);
}

.pattern-type-btn.active {
    background: var(--primary-color);
    color: white;
    border-color: var(--primary-color);
}

.type-icon {
    font-size: 1.5rem;
}

.pattern-display {
    background: var(--card-background);
    border: 3px solid var(--border-color);
    border-radius: 20px;
    padding: 2rem;
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    flex-wrap: wrap;
    min-height: 120px;
    box-shadow: var(--shadow);
}

.pattern-sequence {
    display: flex;
    gap: 1rem;
    align-items: center;
    flex-wrap: wrap;
}

.pattern-block {
    background: var(--background-color);
    border: 3px solid var(--primary-color);
    border-radius: 15px;
    width: 80px;
    height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    transition: all 0.3s ease;
    opacity: 0;
    transform: scale(0.5);
}

.pattern-block.animate-in {
    opacity: 1;
    transform: scale(1);
    animation: bounceIn 0.6s ease-out;
}

.mystery-block {
    background: var(--accent-color);
    border: 3px dashed var(--accent-color);
    border-radius: 15px;
    width: 80px;
    height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 2rem;
    font-weight: bold;
    position: relative;
    transition: all 0.3s ease;
}

.mystery-block.correct-reveal {
    background: var(--success-color);
    border-color: var(--success-color);
    animation: pulse 0.6s ease-in-out;
}

.mystery-block.wrong-reveal {
    background: var(--error-color);
    border-color: var(--error-color);
    animation: shake 0.6s ease-in-out;
}

.block-number {
    font-size: 1.8rem;
    font-weight: bold;
    color: var(--text-color);
}

.color-block {
    width: 50px;
    height: 50px;
    border-radius: 8px;
    border: 2px solid rgba(0,0,0,0.2);
}

.color-block.red { background: #F44336; }
.color-block.blue { background: #2196F3; }
.color-block.green { background: #4CAF50; }
.color-block.yellow { background: #FFEB3B; }
.color-block.purple { background: #9C27B0; }
.color-block.orange { background: #FF9800; }

.shape-emoji {
    font-size: 2.5rem;
}

.pattern-rule-hint {
    background: var(--accent-color);
    color: white;
    padding: 1rem;
    border-radius: 15px;
    margin-bottom: 1.5rem;
    opacity: 0;
    transform: translateY(-10px);
}

.pattern-rule-hint.animate-in {
    opacity: 1;
    transform: translateY(0);
    animation: slideDown 0.5s ease-out;
}

.hint-content {
    font-weight: bold;
    font-size: 1.1rem;
}

.answer-options {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 1rem;
    margin-bottom: 2rem;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
}

.answer-option {
    background: var(--card-background);
    border: 3px solid var(--border-color);
    border-radius: 15px;
    padding: 1rem;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
    min-height: 100px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    opacity: 0;
    transform: scale(0.8);
}

.answer-option.animate-in {
    opacity: 1;
    transform: scale(1);
    animation: bounceIn 0.6s ease-out;
}

.answer-option:hover {
    border-color: var(--primary-color);
    transform: translateY(-3px);
    box-shadow: var(--shadow-hover);
}

.answer-option.correct {
    background: var(--success-color);
    color: white;
    border-color: var(--success-color);
    animation: pulse 0.6s ease-in-out;
}

.answer-option.wrong {
    background: var(--error-color);
    color: white;
    border-color: var(--error-color);
    animation: shake 0.6s ease-in-out;
}

.answer-option.faded {
    opacity: 0.3;
    transform: scale(0.9);
}

.answer-option:disabled {
    cursor: not-allowed;
}

.option-content {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
}

.option-number {
    background: var(--text-light);
    color: white;
    width: 25px;
    height: 25px;
    border-radius: 50%;
    font-size: 0.8rem;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    top: 5px;
    right: 5px;
}

.streak-display {
    background: var(--background-color);
    border: 2px solid var(--border-color);
    border-radius: 15px;
    padding: 1rem;
    margin-bottom: 1rem;
    font-size: 1.2rem;
    font-weight: bold;
    color: var(--primary-color);
    display: inline-block;
}

.feedback {
    text-align: center;
    padding: 1rem;
    border-radius: 15px;
    font-weight: bold;
    font-size: 1.2rem;
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

@keyframes bounceIn {
    0% {
        opacity: 0;
        transform: scale(0.3);
    }
    50% {
        opacity: 1;
        transform: scale(1.1);
    }
    100% {
        opacity: 1;
        transform: scale(1);
    }
}

@keyframes slideDown {
    from {
        opacity: 0;
        transform: translateY(-20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@media (max-width: 768px) {
    .pattern-display {
        padding: 1.5rem;
        gap: 0.8rem;
    }
    
    .pattern-block, .mystery-block {
        width: 60px;
        height: 60px;
    }
    
    .block-number {
        font-size: 1.4rem;
    }
    
    .color-block {
        width: 40px;
        height: 40px;
    }
    
    .shape-emoji {
        font-size: 2rem;
    }
    
    .answer-options {
        grid-template-columns: repeat(2, 1fr);
        gap: 0.8rem;
    }
    
    .answer-option {
        min-height: 80px;
        padding: 0.8rem;
    }
    
    .pattern-type-btn {
        padding: 0.8rem 1rem;
        min-width: 80px;
    }
}

@media (max-width: 480px) {
    .pattern-display {
        padding: 1rem;
        gap: 0.5rem;
    }
    
    .pattern-block, .mystery-block {
        width: 50px;
        height: 50px;
    }
    
    .block-number {
        font-size: 1.2rem;
    }
    
    .color-block {
        width: 30px;
        height: 30px;
    }
    
    .shape-emoji {
        font-size: 1.5rem;
    }
    
    .answer-options {
        grid-template-columns: 1fr 1fr;
        gap: 0.5rem;
    }
    
    .answer-option {
        min-height: 70px;
        padding: 0.5rem;
    }
    
    .instructions {
        font-size: 1.1rem;
    }
    
    .pattern-type-selector {
        gap: 0.5rem;
    }
    
    .pattern-type-btn {
        padding: 0.6rem 0.8rem;
        min-width: 70px;
    }
    
    .type-icon {
        font-size: 1.2rem;
    }
}

/* Touch device optimizations */
@media (hover: none) and (pointer: coarse) {
    .answer-option {
        min-height: 90px;
        padding: 1rem;
    }
    
    .answer-option:hover {
        transform: none;
    }
    
    .answer-option:active {
        transform: scale(0.95);
    }
    
    .pattern-type-btn:hover {
        transform: none;
    }
}
</style>
`;

// Inject CSS
document.head.insertAdjacentHTML('beforeend', patternPainterCSS);