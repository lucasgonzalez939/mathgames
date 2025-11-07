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
                
                <div class="feedback" id="feedback" role="status" aria-live="polite"></div>
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
        this._hintUsed = false;
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
            case 'geometric':
                this.generateMultiplicationPattern(selectedType.factor);
                break;
            case 'fibonacci':
                this.generateFibonacciPattern();
                break;
            case 'alternating':
                this.generateAlternatingPattern();
                break;
            case 'squares':
                this.generateSquaresPattern();
                break;
            case 'increasingStep':
                this.generateIncreasingStepPattern(selectedType.start || 1);
                break;
            case 'altAddSub':
                this.generateAlternatingAddSubPattern(selectedType.aStep || 2, selectedType.bStep || 1);
                break;
        }
    }
    
    getNumberPatternTypes() {
        const list = [];
        const streak = this.consecutiveCorrect || 0;
        const add = (obj, w = 1) => { for (let i=0; i<w; i++) list.push(obj); };

        if (this.difficulty === 'easy') {
            add({ type: 'addition', step: 1 }, 2);
            add({ type: 'addition', step: 2 }, 2);
            add({ type: 'addition', step: 5 });
            add({ type: 'subtraction', step: 1 }, 2);
            add({ type: 'subtraction', step: 2 });
        } else if (this.difficulty === 'medium') {
            add({ type: 'addition', step: 3 }, 2);
            add({ type: 'addition', step: 4 });
            add({ type: 'addition', step: 10 });
            add({ type: 'subtraction', step: 3 });
            add({ type: 'multiplication', factor: 2 }, 2);
            add({ type: 'alternating' });
            add({ type: 'squares' });
            add({ type: 'altAddSub', aStep: 2, bStep: 1 });
        } else { // hard
            add({ type: 'addition', step: 6 });
            add({ type: 'addition', step: 7 });
            add({ type: 'multiplication', factor: 3 }, 2);
            add({ type: 'fibonacci' }, 2);
            add({ type: 'alternating' });
            add({ type: 'geometric', factor: 4 });
            add({ type: 'squares' }, 2);
            add({ type: 'increasingStep', start: 2 });
            add({ type: 'altAddSub', aStep: 3, bStep: 2 });
        }

        if (streak >= 3) {
            add({ type: 'multiplication', factor: 3 });
            add({ type: 'fibonacci' });
            add({ type: 'geometric', factor: 4 });
            add({ type: 'squares' });
        }

        return list.length ? list : [{ type: 'addition', step: 1 }];
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
    
    generateSquaresPattern() {
        const startN = MathGames.randomBetween(1, 5);
        this.currentPattern = [startN**2, (startN+1)**2, (startN+2)**2, (startN+3)**2];
        this.nextInSequence = (startN+4) ** 2;
        this.patternRule = { type: 'squares', startN };
    }

    generateIncreasingStepPattern(startStep = 1) {
        const start = MathGames.randomBetween(1, 10);
        const s1 = start + startStep;
        const s2 = s1 + (startStep + 1);
        const s3 = s2 + (startStep + 2);
        this.currentPattern = [start, s1, s2, s3];
        this.nextInSequence = s3 + (startStep + 3);
        this.patternRule = { type: 'increasingStep', startStep };
    }

    generateAlternatingAddSubPattern(aStep = 2, bStep = 1) {
        const start = MathGames.randomBetween(10, 30);
        // +a, -b, +a, -b
        const s1 = start + aStep;
        const s2 = s1 - bStep;
        const s3 = s2 + aStep;
        this.currentPattern = [start, s1, s2, s3];
        this.nextInSequence = s3 - bStep;
        this.patternRule = { type: 'altAddSub', aStep, bStep };
    }
    
    generateColorPattern() {
        const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];
        const patternLength = this.difficulty === 'easy' ? 2 : (this.difficulty === 'medium' ? 3 : 4);

        // Choose unique colors for base
        const basePattern = MathGames.shuffleArray(colors).slice(0, patternLength);

        // Occasionally use AABB/ABBA template on hard
        let template = null;
        if (this.difficulty === 'hard' && patternLength >= 2 && Math.random() < 0.5) {
            template = Math.random() < 0.5 ? 'AABB' : 'ABBA';
        }

        this.currentPattern = [];
        const cycles = this.difficulty === 'easy' ? 2 : (this.difficulty === 'medium' ? 1.5 : 1);
        const totalLength = Math.floor(patternLength * cycles);

        for (let i = 0; i < totalLength; i++) {
            if (template === 'AABB') {
                const idx = Math.floor((i % 4) / 2);
                this.currentPattern.push(basePattern[idx]);
            } else if (template === 'ABBA') {
                const map = [0,1,1,0];
                this.currentPattern.push(basePattern[map[i % 4]]);
            } else {
                this.currentPattern.push(basePattern[i % patternLength]);
            }
        }

        if (template) {
            const nextIdx = template === 'AABB' ? Math.floor((totalLength % 4) / 2) : [0,1,1,0][totalLength % 4];
            this.nextInSequence = basePattern[nextIdx];
        } else {
            this.nextInSequence = basePattern[totalLength % patternLength];
        }
        this.patternRule = { type: 'color', pattern: basePattern, template };
    }
    
    generateShapePattern() {
        const shapes = ['circle', 'square', 'triangle', 'star', 'heart', 'diamond'];
        const patternLength = this.difficulty === 'easy' ? 2 : (this.difficulty === 'medium' ? 3 : 4);

        const basePattern = MathGames.shuffleArray(shapes).slice(0, patternLength);

        let template = null;
        if (this.difficulty !== 'easy' && patternLength >= 2 && Math.random() < 0.4) {
            template = Math.random() < 0.5 ? 'AABB' : 'ABBA';
        }

        this.currentPattern = [];
        const cycles = this.difficulty === 'easy' ? 2 : 1.5;
        const totalLength = Math.floor(patternLength * cycles);

        for (let i = 0; i < totalLength; i++) {
            if (template === 'AABB') {
                const idx = Math.floor((i % 4) / 2);
                this.currentPattern.push(basePattern[idx]);
            } else if (template === 'ABBA') {
                const map = [0,1,1,0];
                this.currentPattern.push(basePattern[map[i % 4]]);
            } else {
                this.currentPattern.push(basePattern[i % patternLength]);
            }
        }

        if (template) {
            const nextIdx = template === 'AABB' ? Math.floor((totalLength % 4) / 2) : [0,1,1,0][totalLength % 4];
            this.nextInSequence = basePattern[nextIdx];
        } else {
            this.nextInSequence = basePattern[totalLength % patternLength];
        }
        this.patternRule = { type: 'shape', pattern: basePattern, template };
    }
    
    generateAnswerOptions() {
        // Safety: ensure nextInSequence is valid to avoid infinite loops
        if (this.nextInSequence === undefined || this.nextInSequence === null) {
            console.warn('PatternPainter: nextInSequence was not set. Regenerating pattern.');
            // Regenerate a simple safe pattern based on current type
            if (this.patternType === 'number') {
                this.generateAdditionPattern(1);
            } else if (this.patternType === 'color') {
                this.generateColorPattern();
            } else {
                this.generateShapePattern();
            }
        }

        this.answerOptions = [this.nextInSequence];

        const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];
        const shapes = ['circle', 'square', 'triangle', 'star', 'heart', 'diamond'];
        
        // Pattern-aware distractors for numbers
        if (this.patternType === 'number') {
            const suggestions = this.generatePatternAwareNumberDistractors();
            for (const s of suggestions) {
                if (this.answerOptions.length >= 4) break;
                if (s !== undefined && s !== null && !Number.isNaN(s) && !this.answerOptions.includes(s)) {
                    this.answerOptions.push(s);
                }
            }
        }

        // Generate remaining distractors with attempt cap to prevent infinite loops
        let attempts = 0;
        while (this.answerOptions.length < 4 && attempts < 100) {
            attempts++;
            let distractor;
            if (this.patternType === 'number') {
                if (typeof this.nextInSequence === 'number' && !Number.isNaN(this.nextInSequence)) {
                    const span = Math.max(5, Math.floor(Math.abs(this.nextInSequence) * 0.2));
                    const delta = MathGames.randomBetween(-span, span) || 1; // avoid zero delta
                    distractor = this.nextInSequence + delta;
                    if (distractor <= 0) distractor = this.nextInSequence + Math.abs(delta);
                }
            } else if (this.patternType === 'color') {
                distractor = colors[Math.floor(Math.random() * colors.length)];
            } else if (this.patternType === 'shape') {
                distractor = shapes[Math.floor(Math.random() * shapes.length)];
            }
            if (distractor !== undefined && distractor !== null && !this.answerOptions.includes(distractor)) {
                this.answerOptions.push(distractor);
            }
        }

        // Fallbacks if we still lack options
        if (this.answerOptions.length < 4) {
            if (this.patternType === 'number') {
                const base = (typeof this.nextInSequence === 'number' && !Number.isNaN(this.nextInSequence)) ? this.nextInSequence : 1;
                for (let k = 1; this.answerOptions.length < 4 && k <= 4; k++) {
                    const cand = base + k;
                    if (!this.answerOptions.includes(cand)) this.answerOptions.push(cand);
                }
            } else if (this.patternType === 'color') {
                for (const c of colors) {
                    if (this.answerOptions.length >= 4) break;
                    if (!this.answerOptions.includes(c)) this.answerOptions.push(c);
                }
            } else if (this.patternType === 'shape') {
                for (const s of shapes) {
                    if (this.answerOptions.length >= 4) break;
                    if (!this.answerOptions.includes(s)) this.answerOptions.push(s);
                }
            }
        }

        this.answerOptions = MathGames.shuffleArray(this.answerOptions);
    }

    generatePatternAwareNumberDistractors() {
        const out = [];
        const next = this.nextInSequence;
        const last = this.currentPattern[this.currentPattern.length - 1];
        const prev = this.currentPattern[this.currentPattern.length - 2];
        const pr = this.patternRule || {};

        const push = (v) => {
            if (v === undefined || v === null) return;
            if (Number.isNaN(v)) return;
            if (v <= 0) return;
            if (v === next) return;
            if (!out.includes(v)) out.push(v);
        };

        switch (pr.type) {
            case 'addition': {
                const s = pr.step || 1;
                push(next + s);
                push(next - s);
                push(last);
                push(next + 1);
                break;
            }
            case 'subtraction': {
                const s = pr.step || 1;
                push(next + s);
                push(next - s);
                push(last);
                push(next - 1);
                break;
            }
            case 'multiplication':
            case 'geometric': {
                const f = pr.factor || 2;
                push(next * f);
                if (next % f === 0) push(next / f);
                push(last * f);
                push(next + f);
                break;
            }
            case 'fibonacci': {
                if (typeof last === 'number' && typeof prev === 'number') {
                    push(last * 2);
                    push(prev * 2);
                    push(last + prev - 1);
                    push(last + prev + 1);
                }
                break;
            }
            case 'alternating': {
                const set = new Set(this.currentPattern);
                for (const v of set) { if (v !== next) push(v); }
                push(last + 1);
                push(last - 1);
                break;
            }
            case 'squares': {
                const root = Math.round(Math.sqrt(next));
                push((root + 1) ** 2);
                if (root - 1 > 0) push((root - 1) ** 2);
                push(next + (2 * root + 1));
                push(last);
                break;
            }
            case 'increasingStep': {
                if (typeof last === 'number' && typeof prev === 'number') {
                    const lastInc = last - prev;
                    push(last + lastInc);
                    push(last + lastInc + 2);
                }
                push(last);
                break;
            }
            case 'altAddSub': {
                const a = pr.aStep || 2;
                const b = pr.bStep || 1;
                const reachedByPlus = next > last;
                if (reachedByPlus) {
                    push(last - b);
                } else {
                    push(last + a);
                }
                push(last);
                push(next + (reachedByPlus ? -1 : 1));
                break;
            }
        }
        return out;
    }
    
    renderPattern() {
        // Reset mystery block and feedback so previous answer doesn't persist
        const nextBlock = document.getElementById('nextBlock');
        if (nextBlock) {
            nextBlock.classList.remove('correct-reveal', 'wrong-reveal');
            nextBlock.innerHTML = '<span class="mystery-symbol">?</span>';
        }
        const feedback = document.getElementById('feedback');
        if (feedback) {
            feedback.textContent = '';
            feedback.className = 'feedback';
        }
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

    // Accessible text for answer options
    describeOption(option) {
        if (this.patternType === 'number') return String(option);
        if (this.patternType === 'color') return String(option);
        if (this.patternType === 'shape') return String(option);
        return String(option);
    }
    
    renderAnswerOptions() {
        const container = document.getElementById('answerOptions');
        container.innerHTML = '';
        
        this.answerOptions.forEach((option, index) => {
            const optionBtn = document.createElement('button');
            optionBtn.className = 'answer-option';
            // Store the logical value for strict comparison later
            optionBtn.setAttribute('data-value', typeof option === 'number' ? option.toString() : option);
            optionBtn.setAttribute('aria-label', `Answer option ${index + 1}: ${this.describeOption(option)}`);
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
        
        // Show success feedback (guard i18n availability)
        const continueMsg = (typeof i18n !== 'undefined' && typeof i18n.get === 'function')
            ? i18n.get('pattern-continue')
            : 'Great! Keep going!';
        this.showFeedback('🎉 ' + continueMsg, 'success');
        
    // Award points (reduced if hint used)
    const basePoints = 20 * this.level * (this.consecutiveCorrect > 3 ? 2 : 1);
    this.updateScore(this._hintUsed ? Math.max(5, Math.floor(basePoints * 0.6)) : basePoints);
        // Record achievement progress
        this.recordCorrectAnswer();
        
        // Extend pattern or generate new one
        setTimeout(() => {
            this._hintUsed = false;
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
        
        const tryAgainMsg = (typeof i18n !== 'undefined' && typeof i18n.get === 'function')
            ? i18n.get('try-again')
            : 'Try again!';
        this.showFeedback('❌ ' + tryAgainMsg, 'error');
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
        const pr = this.patternRule || {};
        if (pr.type === 'addition') {
            this.nextInSequence += pr.step;
        } else if (pr.type === 'subtraction') {
            this.nextInSequence -= pr.step;
        } else if (pr.type === 'multiplication' || pr.type === 'geometric') {
            this.nextInSequence *= pr.factor;
        } else if (pr.type === 'fibonacci') {
            const last = this.currentPattern[this.currentPattern.length - 1];
            const secondLast = this.currentPattern[this.currentPattern.length - 2];
            this.nextInSequence = last + secondLast;
        } else if (pr.type === 'alternating') {
            // Alternate between the distinct values observed
            const set = Array.from(new Set(this.currentPattern));
            if (set.length >= 2) {
                this.nextInSequence = (this.nextInSequence === set[0]) ? set[1] : set[0];
            } else {
                const current = this.currentPattern[this.currentPattern.length - 1];
                const prev = this.currentPattern[this.currentPattern.length - 2];
                this.nextInSequence = this.nextInSequence === current ? prev : current;
            }
        } else if (pr.type === 'squares') {
            const root = Math.round(Math.sqrt(this.nextInSequence));
            this.nextInSequence = (root + 1) ** 2;
        } else if (pr.type === 'increasingStep') {
            const last = this.currentPattern[this.currentPattern.length - 1];
            const L = this.currentPattern.length; // includes start at index 0
            this.nextInSequence = last + (pr.startStep + (L - 1));
        } else if (pr.type === 'altAddSub') {
            const last = this.currentPattern[this.currentPattern.length - 1];
            const a = pr.aStep || 2;
            const b = pr.bStep || 1;
            const L = this.currentPattern.length; // next index is L
            const delta = (L % 2 === 1) ? +a : -b;
            this.nextInSequence = last + delta;
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
        this._hintUsed = true;
        
        if (this.patternType === 'number') {
            if (this.patternRule.type === 'addition') {
                hintText = `Each number increases by ${this.patternRule.step}`;
            } else if (this.patternRule.type === 'subtraction') {
                hintText = `Each number decreases by ${this.patternRule.step}`;
            } else if (this.patternRule.type === 'multiplication') {
                hintText = `Each number is multiplied by ${this.patternRule.factor}`;
            } else if (this.patternRule.type === 'geometric') {
                hintText = `Each number is multiplied by ${this.patternRule.factor}`;
            } else if (this.patternRule.type === 'fibonacci') {
                hintText = 'Each number is the sum of the two numbers before it';
            } else if (this.patternRule.type === 'alternating') {
                hintText = 'The pattern alternates between two numbers';
            } else if (this.patternRule.type === 'squares') {
                hintText = 'These are perfect squares (n×n): 1, 4, 9, 16, ...';
            } else if (this.patternRule.type === 'increasingStep') {
                hintText = 'The step increases by 1 each time (e.g., +2, +3, +4, ...)';
            } else if (this.patternRule.type === 'altAddSub') {
                hintText = `It alternates: +${this.patternRule.aStep}, then -${this.patternRule.bStep}`;
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

// Inject CSS once to avoid duplicate styles and memory growth
if (!document.getElementById('pattern-painter-style')) {
    const styleContainer = document.createElement('div');
    styleContainer.id = 'pattern-painter-style';
    styleContainer.innerHTML = patternPainterCSS;
    document.head.appendChild(styleContainer);
}