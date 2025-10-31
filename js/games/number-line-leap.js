// Number Line Leap Game
class NumberLineLeap extends BaseGame {
    constructor(container) {
        super(container);
        this.gameType = 'number-line-leap'; // For achievement tracking
        this.currentProblem = null;
        this.correctAnswer = 0;
        this.currentStep = 'step1';
        this.characterPosition = 0;
        this.numberLineMin = 0;
        this.numberLineMax = 10; // Initialize to easy difficulty default
    }
    
    getTitleKey() {
        return 'game-1-title';
    }
    
    setupGame() {
        const gameArea = document.getElementById('gameArea');
        gameArea.innerHTML = `
            <div class="numberline-container">
                <div class="problem-display" id="problemDisplay">
                    <span class="problem-text" id="problemText"></span>
                </div>
                <div class="instructions" data-i18n="numberline-instructions">Click on the number where the frog should land!</div>
                
                <div class="number-line-wrapper">
                    <div class="number-line" id="numberLine"></div>
                    <div class="character" id="character">🐸</div>
                </div>
                
                <div class="feedback" id="feedback"></div>
            </div>
        `;
        
        this.createNumberLine();
        this.generateNewProblem();
        this.setupEventListeners();
        
        // Retranslate after adding content
        if (typeof i18n !== 'undefined') {
            i18n.translatePage();
        }
    }
    
    createNumberLine() {
        const numberLine = document.getElementById('numberLine');
        if (!numberLine) return; // Safety check
        
        numberLine.innerHTML = '';
        
        // Adjust range based on difficulty
        switch(this.difficulty) {
            case 'easy':
                this.numberLineMax = 10;
                break;
            case 'medium':
                this.numberLineMax = 20;
                break;
            case 'hard':
                this.numberLineMax = 30;
                break;
        }
        
        const numberLineWidth = numberLine.offsetWidth || 800; // Fallback width
        
        // Create number line marks with clickable numbers
        for (let i = this.numberLineMin; i <= this.numberLineMax; i++) {
            const mark = document.createElement('div');
            mark.className = 'number-mark';
            mark.innerHTML = `
                <div class="mark-line"></div>
                <div class="mark-number clickable" data-number="${i}">${i}</div>
            `;
            // Use pixel-based positioning for consistency
            const leftPosition = (i / this.numberLineMax) * 100;
            mark.style.left = `${leftPosition}%`;
            numberLine.appendChild(mark);
        }
        
        // Position character at 0
        this.moveCharacterTo(0);
        
        // Add click listeners to numbers
        this.addNumberClickListeners();
    }
    
    generateNewProblem() {
        const maxNum = Math.floor(this.numberLineMax / 2);
        // Addition only across all difficulties for learner appropriateness
        this.currentProblem = MathGames.generateAddition(maxNum);
        
        this.correctAnswer = this.currentProblem.answer;
        // Always start from 0 on the number line
        this.characterPosition = 0;
        this.waitingForAnswer = true;
        
        this.updateProblemDisplay();
        this.moveCharacterTo(this.characterPosition);
        this.highlightClickableNumbers();
        
        // Clear any previous feedback
        const feedback = document.getElementById('feedback');
        if (feedback) feedback.innerHTML = '';
        
        // Start problem timer for achievement tracking
        this.startProblem();
    }
    
    updateProblemDisplay() {
        const problemText = document.getElementById('problemText');
        const { a, b, operator } = this.currentProblem;
        problemText.innerHTML = `${a} ${operator} ${b} = <span class="answer-placeholder">?</span>`;
    }
    
    addNumberClickListeners() {
        const numbers = document.querySelectorAll('.mark-number.clickable');
        numbers.forEach(numEl => {
            numEl.addEventListener('click', (e) => {
                if (!this.waitingForAnswer) return;
                
                const selectedNumber = parseInt(numEl.getAttribute('data-number'));
                this.handleNumberSelection(selectedNumber);
            });
        });
    }
    
    highlightClickableNumbers() {
        const numbers = document.querySelectorAll('.mark-number.clickable');
        numbers.forEach(numEl => {
            numEl.classList.add('active');
        });
    }
    
    handleNumberSelection(selectedNumber) {
        if (!this.waitingForAnswer) return;
        
        this.waitingForAnswer = false;
        
        // Remove active state from all numbers
        const numbers = document.querySelectorAll('.mark-number.clickable');
        numbers.forEach(numEl => {
            numEl.classList.remove('active');
        });
        
        // Check if answer is correct
        if (selectedNumber === this.correctAnswer) {
            // Animate jump to correct position
            this.animateJump(selectedNumber, selectedNumber - this.characterPosition);
            
            setTimeout(() => {
                this.showCorrectFeedback();
            }, 900);
        } else {
            // Show error and hint
            this.showIncorrectFeedback(selectedNumber);
        }
    }
    
    animateJump(newPosition, jumpAmount) {
        const character = document.getElementById('character');
        
        if (!character) return; // Safety check
        
        // Create arc animation
        const startPos = this.characterPosition;
        const endPos = newPosition;
        const arcHeight = 60; // Fixed arc height for consistency
        
        // Draw jump arc
        this.drawJumpArc(startPos, endPos, jumpAmount > 0 ? '#4CAF50' : '#F44336');
        
        // Calculate positions
        const startPercent = (startPos / this.numberLineMax) * 100;
        const endPercent = (endPos / this.numberLineMax) * 100;
        
        // Animate character with CSS only (no transform that changes X position)
        character.style.transition = 'left 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        character.style.left = `${endPercent}%`;
        
        // Add vertical jump animation separately
        character.style.animation = 'frogJump 0.8s ease-in-out';
        
        // Update character position
        this.characterPosition = newPosition;
        
        setTimeout(() => {
            this.playSound('pop');
        }, 400);
        
        setTimeout(() => {
            character.style.animation = '';
            character.style.transition = '';
        }, 800);
    }
    
    drawJumpArc(startPos, endPos, color) {
        const numberLine = document.getElementById('numberLine');
        const arc = document.createElement('div');
        arc.className = 'jump-arc';
        
        const startPercent = (startPos / this.numberLineMax) * 100;
        const endPercent = (endPos / this.numberLineMax) * 100;
        const width = Math.abs(endPercent - startPercent);
        
        arc.style.cssText = `
            position: absolute;
            left: ${Math.min(startPercent, endPercent)}%;
            width: ${width}%;
            height: 50px;
            top: -50px;
            border: 3px solid ${color};
            border-bottom: none;
            border-radius: ${width}% ${width}% 0 0;
            opacity: 0.7;
            pointer-events: none;
        `;
        
        numberLine.appendChild(arc);
        
        // Remove arc after animation
        setTimeout(() => {
            if (arc.parentNode) {
                arc.parentNode.removeChild(arc);
            }
        }, 2000);
    }
    
    moveCharacterTo(position) {
        const character = document.getElementById('character');
        const percent = (position / this.numberLineMax) * 100;
        character.style.left = `${percent}%`;
    }
    
    showCorrectFeedback() {
        const feedback = document.getElementById('feedback');
        const problemText = document.getElementById('problemText');
        
        // Correct answer
        this.playSound('success');
        const encouragement = MathGames.getEncouragingMessage();
        feedback.innerHTML = `<div class="success-message">🎉 ${encouragement} 🎉</div>`;
        
        // Update problem display to show answer
        const { a, b, operator } = this.currentProblem;
        problemText.innerHTML = `${a} ${operator} ${b} = <span class="correct-answer">${this.correctAnswer}</span>`;
        
        // Record achievement
        this.recordCorrectAnswer();
        
        // Update score and level
        this.updateScore(10 * this.level);
        
        // Add celebration animation
        const character = document.getElementById('character');
        character.classList.add('bounce');
        setTimeout(() => character.classList.remove('bounce'), 600);
        
        // Generate new problem after delay
        setTimeout(() => {
            if (this.score > 0 && this.score % 50 === 0) {
                this.updateLevel();
            }
            feedback.innerHTML = '';
            this.generateNewProblem();
        }, 2500);
        
        // Retranslate feedback
        if (typeof i18n !== 'undefined') {
            i18n.translatePage();
        }
    }
    
    showIncorrectFeedback(selectedNumber) {
        const feedback = document.getElementById('feedback');
        
        this.playSound('wrong');
        
        // Record incorrect answer for achievement tracking
        this.recordIncorrectAnswer();
        
        const tryAgainMsg = MathGames.getTryAgainMessage();
        const { a, b, operator } = this.currentProblem;
        
        // Give helpful hint based on what they selected
        let hint = '';
        if (operator === '+') {
            if (selectedNumber < this.correctAnswer) {
                hint = `${i18n.get('hint-too-small-forward')} ${a}.`;
            } else {
                hint = `${i18n.get('hint-too-big-need')} ${a} + ${b}.`;
            }
        } else {
            if (selectedNumber < this.correctAnswer) {
                hint = `${i18n.get('hint-too-small-subtract')} ${a} ${i18n.get('hint-and-subtract')} ${b}.`;
            } else {
                hint = `${i18n.get('hint-too-big-need')} ${a} - ${b}.`;
            }
        }
        
        feedback.innerHTML = `<div class="try-again-message">${tryAgainMsg}<br><small>${hint}</small></div>`;
        
        // Allow another attempt
        setTimeout(() => {
            feedback.innerHTML = '';
            this.waitingForAnswer = true;
            this.highlightClickableNumbers();
        }, 3000);
        
        // Retranslate feedback
        if (typeof i18n !== 'undefined') {
            i18n.translatePage();
        }
    }
    
    setupEventListeners() {
        // Keyboard support for number selection (1-9, 0)
        document.addEventListener('keydown', (e) => {
            if (!this.waitingForAnswer) return;
            
            const key = e.key;
            if (key >= '0' && key <= '9') {
                const number = parseInt(key);
                if (number >= this.numberLineMin && number <= this.numberLineMax) {
                    this.handleNumberSelection(number);
                }
            } else if (key === 'Enter') {
                // Could be used for showing hint in future
            }
        });
    }
    
    onDifficultyChange() {
        this.createNumberLine();
        this.generateNewProblem();
    }
    
    restart() {
        super.restart();
    }
}

// Add CSS for Number Line Leap
const numberLineCSS = `
<style>
.numberline-container {
    text-align: center;
    padding: 20px;
}

.problem-display {
    font-size: 2.5rem;
    font-weight: bold;
    margin-bottom: 1rem;
    color: var(--primary-color);
    font-family: var(--font-primary);
}

.answer-placeholder {
    color: var(--accent-color);
    background: var(--background-color);
    padding: 0 15px;
    border-radius: 10px;
    border: 3px dashed var(--accent-color);
}

.correct-answer {
    color: var(--success-color);
    background: var(--background-color);
    padding: 0 15px;
    border-radius: 10px;
    animation: pulse 0.6s ease-in-out;
}

.instructions {
    font-size: 1.2rem;
    color: var(--text-light);
    margin-bottom: 2rem;
}

.number-line-wrapper {
    position: relative;
    height: 120px;
    margin: 2rem 0;
    background: linear-gradient(to bottom, transparent 60px, var(--border-color) 60px, var(--border-color) 62px, transparent 62px);
}

.number-line {
    position: relative;
    height: 100%;
    max-width: 800px;
    margin: 0 auto;
}

.number-mark {
    position: absolute;
    top: 50px;
    transform: translateX(-50%);
}

.mark-line {
    width: 2px;
    height: 20px;
    background: var(--text-color);
    margin: 0 auto;
}

.mark-number {
    margin-top: 5px;
    font-weight: bold;
    font-size: 0.9rem;
    color: var(--text-color);
    padding: 8px 12px;
    border-radius: 8px;
    transition: all 0.3s ease;
}

.mark-number.clickable {
    cursor: pointer;
    user-select: none;
}

.mark-number.clickable:hover {
    background: var(--background-color);
    transform: scale(1.2);
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}

.mark-number.clickable.active {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    animation: numberPulse 1.5s ease-in-out infinite;
}

@keyframes numberPulse {
    0%, 100% {
        transform: scale(1);
        box-shadow: 0 0 0 0 rgba(102, 126, 234, 0.7);
    }
    50% {
        transform: scale(1.1);
        box-shadow: 0 0 0 10px rgba(102, 126, 234, 0);
    }
}

.character {
    position: absolute;
    top: 20px;
    font-size: 2.5rem;
    left: 0%;
    transform: translateX(-50%);
    z-index: 10;
    filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.3));
    will-change: left;
}

.feedback {
    margin-top: 1rem;
    min-height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.success-message {
    background: var(--success-color);
    color: white;
    padding: 1rem 2rem;
    border-radius: 25px;
    font-weight: bold;
    font-size: 1.2rem;
    animation: bounce 0.6s ease-in-out;
}

.try-again-message {
    background: var(--warning-color);
    color: white;
    padding: 1rem 2rem;
    border-radius: 25px;
    font-weight: bold;
    font-size: 1.2rem;
    animation: shake 0.6s ease-in-out;
}

.try-again-message small {
    display: block;
    margin-top: 0.5rem;
    font-size: 0.9rem;
    font-weight: normal;
    opacity: 0.9;
}

.error-message {
    background: var(--error-color);
    color: white;
    padding: 1rem 2rem;
    border-radius: 25px;
    font-weight: bold;
    font-size: 1.2rem;
    animation: shake 0.6s ease-in-out;
}

.jump-arc {
    animation: arcFade 2s ease-out forwards;
}

@keyframes arcFade {
    0% { opacity: 0.8; }
    100% { opacity: 0; }
}

@keyframes frogJump {
    0% { 
        transform: translateX(-50%) translateY(0);
    }
    50% { 
        transform: translateX(-50%) translateY(-60px);
    }
    100% { 
        transform: translateX(-50%) translateY(0);
    }
}

@media (max-width: 768px) {
    .problem-display {
        font-size: 2rem;
    }
    
    .character {
        font-size: 2rem;
    }
    
    .number-line-wrapper {
        margin: 1rem 0;
    }
    
    .mark-number {
        font-size: 0.8rem;
    }
}

@media (max-width: 480px) {
    .problem-display {
        font-size: 1.5rem;
    }
    
    .instructions {
        font-size: 1rem;
    }
    
    .btn-jump {
        font-size: 1rem;
        min-width: 120px;
    }
}
</style>
`;

// Inject CSS
document.head.insertAdjacentHTML('beforeend', numberLineCSS);