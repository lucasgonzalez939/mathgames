// Fact Family Farm Game
class FactFamilyFarm extends BaseGame {
    constructor(container) {
        super(container);
        this.gameType = 'fact-family-farm';
        this.targetNumber = 10;
        this.barnItems = [];
        this.fieldItems = [];
        this.draggedElement = null;
        this.completedPairs = 0;
    }
    
    getTitleKey() {
        return 'game-4-title';
    }
    
    setupGame() {
        const gameArea = document.getElementById('gameArea');
        gameArea.innerHTML = `
            <div class="factfarm-container">
                <div class="instructions">
                    <span data-i18n="factfarm-instructions">Drag animals to the barn to make</span>
                    <span class="target-number" id="targetDisplay">${this.targetNumber}</span>
                </div>
                
                <div class="farm-layout">
                    <div class="barn-section">
                        <div class="barn-title" data-i18n="factfarm-barn">Barn</div>
                        <div class="barn" id="barn">
                            <div class="barn-target">
                                <span class="barn-number" id="barnTarget">${this.targetNumber}</span>
                            </div>
                            <div class="barn-animals" id="barnAnimals">
                                <!-- Animals in barn will appear here -->
                            </div>
                            <div class="barn-sum">
                                <span data-i18n="total">Total</span>: <span id="barnSum">0</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="field-section">
                        <div class="field-title" data-i18n="factfarm-field">Field</div>
                        <div class="field" id="field">
                            <!-- Animals in field will appear here -->
                        </div>
                    </div>
                </div>
                
                <div class="pairs-completed">
                    <span data-i18n="pairs-found">Pairs found</span>: <span id="pairsCount">${this.completedPairs}</span>
                </div>
                
                <div class="feedback" id="feedback"></div>
            </div>
        `;
        
        this.generateNewRound();
        this.setupEventListeners();
        
        // Retranslate after adding content
        if (typeof i18n !== 'undefined') {
            i18n.translatePage();
        }
    }
    
    generateNewRound() {
        // Set target based on difficulty
        switch(this.difficulty) {
            case 'easy':
                this.targetNumber = MathGames.randomBetween(5, 10);
                break;
            case 'medium':
                this.targetNumber = MathGames.randomBetween(8, 15);
                break;
            case 'hard':
                this.targetNumber = MathGames.randomBetween(10, 20);
                break;
        }
        
        // Generate number bonds (pairs that sum to target)
        const pairs = MathGames.generateNumberBonds(this.targetNumber);
        
        // Add some extra distractor numbers
        const distractors = [];
        for (let i = 0; i < 3; i++) {
            let distractor;
            do {
                distractor = MathGames.randomBetween(1, this.targetNumber + 5);
            } while (pairs.flat().includes(distractor) || distractors.includes(distractor));
            distractors.push(distractor);
        }
        
        // Combine all numbers and shuffle
        this.fieldItems = MathGames.shuffleArray([...pairs.flat(), ...distractors]);
        this.barnItems = [];
        
        this.updateDisplay();
        this.renderAnimals();
        // Start timing for a new round problem
        this.startProblem();
    }
    
    updateDisplay() {
        document.getElementById('targetDisplay').textContent = this.targetNumber;
        document.getElementById('barnTarget').textContent = this.targetNumber;
        document.getElementById('barnSum').textContent = this.calculateBarnSum();
        document.getElementById('pairsCount').textContent = this.completedPairs;
    }
    
    calculateBarnSum() {
        return this.barnItems.reduce((sum, item) => sum + item, 0);
    }
    
    renderAnimals() {
        this.renderFieldAnimals();
        this.renderBarnAnimals();
    }
    
    renderFieldAnimals() {
        const field = document.getElementById('field');
        field.innerHTML = '';
        
        this.fieldItems.forEach((number, index) => {
            const animal = this.createAnimalElement(number, 'field', index);
            field.appendChild(animal);
        });
    }
    
    renderBarnAnimals() {
        const barnAnimals = document.getElementById('barnAnimals');
        barnAnimals.innerHTML = '';
        
        this.barnItems.forEach((number, index) => {
            const animal = this.createAnimalElement(number, 'barn', index);
            barnAnimals.appendChild(animal);
        });
    }
    
    createAnimalElement(number, location, index) {
        const animal = document.createElement('div');
        animal.className = `animal ${location}-animal`;
        animal.setAttribute('data-number', number);
        animal.setAttribute('data-location', location);
        animal.setAttribute('data-index', index);
        
        // Assign animal emoji based on number
        const animalEmojis = ['🐶', '🐱', '🐷', '🐮', '🐸', '🐥', '🐰', '🦆', '🐴', '🐺', 
                             '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐵', '🐒', '🐘', '🦒'];
        const emoji = animalEmojis[number % animalEmojis.length];
        
        animal.innerHTML = `
            <div class="animal-emoji">${emoji}</div>
            <div class="animal-number">${number}</div>
        `;
        
        // Make draggable only if in field
        if (location === 'field') {
            animal.draggable = true;
            animal.addEventListener('dragstart', (e) => this.handleDragStart(e));
            animal.addEventListener('dragend', (e) => this.handleDragEnd(e));
            
            // Touch support
            animal.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
            animal.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
            animal.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: false });
        }
        
        return animal;
    }
    
    setupEventListeners() {
        const barn = document.getElementById('barn');
        
        // Barn drop zone events
        barn.addEventListener('dragover', (e) => this.handleDragOver(e));
        barn.addEventListener('drop', (e) => this.handleDrop(e));
        
        // Field return zone (for removing from barn)
        const field = document.getElementById('field');
        field.addEventListener('dragover', (e) => this.handleDragOver(e));
        field.addEventListener('drop', (e) => this.handleFieldDrop(e));
    }
    
    // Drag and Drop Handlers
    handleDragStart(e) {
        // Get the animal element (might be a child that's dragged)
        let element = e.target;
        while (element && !element.classList.contains('animal')) {
            element = element.parentElement;
        }
        
        if (!element) return;
        
        this.draggedElement = element;
        element.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', element.getAttribute('data-number'));
    }
    
    handleDragEnd(e) {
        let element = e.target;
        while (element && !element.classList.contains('animal')) {
            element = element.parentElement;
        }
        if (element) {
            element.classList.remove('dragging');
        }
    }
    
    handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        return false;
    }
    
    handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        
        if (!this.draggedElement) return false;
        
        const number = parseInt(this.draggedElement.getAttribute('data-number'));
        const fromLocation = this.draggedElement.getAttribute('data-location');
        
        if (fromLocation === 'field') {
            this.moveAnimalToBarn(number);
        }
        
        this.draggedElement = null;
        return false;
    }
    
    handleFieldDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        
        if (!this.draggedElement) return false;
        
        const number = parseInt(this.draggedElement.getAttribute('data-number'));
        const fromLocation = this.draggedElement.getAttribute('data-location');
        
        if (fromLocation === 'barn') {
            this.moveAnimalToField(number);
        }
        
        this.draggedElement = null;
        return false;
    }
    
    // Touch Handlers
    handleTouchStart(e) {
        e.preventDefault();
        
        // Get the animal element (might be a child that's touched)
        let element = e.target;
        while (element && !element.classList.contains('animal')) {
            element = element.parentElement;
        }
        
        if (!element) return;
        
        const touch = e.touches[0];
        this.draggedElement = element;
        element.classList.add('dragging');
        
        // Store initial touch position
        this.draggedElement.touchStartX = touch.clientX;
        this.draggedElement.touchStartY = touch.clientY;
    }
    
    handleTouchMove(e) {
        e.preventDefault();
        if (!this.draggedElement) return;
        
        const touch = e.touches[0];
        const element = this.draggedElement;
        
        // Move element with finger
        element.style.position = 'fixed';
        element.style.zIndex = '1000';
        element.style.left = (touch.clientX - 40) + 'px';
        element.style.top = (touch.clientY - 40) + 'px';
        element.style.pointerEvents = 'none';
    }
    
    handleTouchEnd(e) {
        e.preventDefault();
        if (!this.draggedElement) return;
        
        const touch = e.changedTouches[0];
        const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
        
        // Reset element style
        this.draggedElement.style.position = '';
        this.draggedElement.style.zIndex = '';
        this.draggedElement.style.left = '';
        this.draggedElement.style.top = '';
        this.draggedElement.style.pointerEvents = '';
        this.draggedElement.classList.remove('dragging');
        
        // Check if dropped on barn or field
        const barn = document.getElementById('barn');
        const field = document.getElementById('field');
        
        const number = parseInt(this.draggedElement.getAttribute('data-number'));
        const fromLocation = this.draggedElement.getAttribute('data-location');
        
        if (barn.contains(elementBelow) && fromLocation === 'field') {
            this.moveAnimalToBarn(number);
        } else if (field.contains(elementBelow) && fromLocation === 'barn') {
            this.moveAnimalToField(number);
        }
        
        this.draggedElement = null;
    }
    
    moveAnimalToBarn(number) {
        const newSum = this.calculateBarnSum() + number;
        
        if (newSum > this.targetNumber) {
            // Exceeds target - reject
            this.playSound('wrong');
            this.showFeedback('Too much! The barn can only hold ' + this.targetNumber + '.', 'error');
            this.animateRejection();
            // Record incorrect attempt for achievement tracking
            this.recordIncorrectAnswer();
            return;
        }
        
        // Move from field to barn
        const fieldIndex = this.fieldItems.indexOf(number);
        if (fieldIndex > -1) {
            this.fieldItems.splice(fieldIndex, 1);
            this.barnItems.push(number);
            
            this.updateDisplay();
            this.renderAnimals();
            
            if (newSum === this.targetNumber) {
                this.checkForCompletePair();
            }
        }
    }
    
    moveAnimalToField(number) {
        // Move from barn to field
        const barnIndex = this.barnItems.indexOf(number);
        if (barnIndex > -1) {
            this.barnItems.splice(barnIndex, 1);
            this.fieldItems.push(number);
            
            this.updateDisplay();
            this.renderAnimals();
        }
    }
    
    checkForCompletePair() {
        if (this.calculateBarnSum() === this.targetNumber) {
            // Found a complete pair!
            this.playSound('success');
            this.completedPairs++;
            
            // Show success animation
            this.animateSuccess();
            
            // Award points
            this.updateScore(15 * this.level);
            // Record achievement for completing a pair that sums to target
            this.recordCorrectAnswer();
            
            // Clear barn after delay
            setTimeout(() => {
                this.barnItems = [];
                this.updateDisplay();
                this.renderAnimals();
                
                // Check if all pairs are found
                if (this.fieldItems.length === 0 || !this.canMakeMorePairs()) {
                    this.completeRound();
                }
            }, 2000);
        }
    }
    
    canMakeMorePairs() {
        // Check if remaining field items can make valid pairs
        for (let i = 0; i < this.fieldItems.length; i++) {
            for (let j = i + 1; j < this.fieldItems.length; j++) {
                if (this.fieldItems[i] + this.fieldItems[j] === this.targetNumber) {
                    return true;
                }
            }
        }
        return false;
    }
    
    animateSuccess() {
        const barn = document.getElementById('barn');
        barn.classList.add('success-glow');
        
        this.showFeedback('🎉 Perfect! You made ' + this.targetNumber + '! 🎉', 'success');
        
        // Add floating hearts
        this.createFloatingHearts();
        
        setTimeout(() => {
            barn.classList.remove('success-glow');
        }, 2000);
    }
    
    animateRejection() {
        const barn = document.getElementById('barn');
        barn.classList.add('shake');
        
        setTimeout(() => {
            barn.classList.remove('shake');
        }, 600);
    }
    
    createFloatingHearts() {
        const barn = document.getElementById('barn');
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                const heart = document.createElement('div');
                heart.className = 'floating-heart';
                heart.textContent = '❤️';
                heart.style.left = Math.random() * 100 + '%';
                barn.appendChild(heart);
                
                setTimeout(() => {
                    if (heart.parentNode) {
                        heart.parentNode.removeChild(heart);
                    }
                }, 2000);
            }, i * 200);
        }
    }
    
    showFeedback(message, type) {
        const feedback = document.getElementById('feedback');
        feedback.className = `feedback ${type}`;
        feedback.textContent = message;
        
        setTimeout(() => {
            feedback.textContent = '';
            feedback.className = 'feedback';
        }, 3000);
    }
    
    completeRound() {
        this.showFeedback('🏆 All pairs found! Great job! 🏆', 'success');
        
        if (this.score > 0 && this.score % 75 === 0) {
            this.updateLevel();
        }
        
        setTimeout(() => {
            this.generateNewRound();
        }, 3000);
    }
    
    onDifficultyChange() {
        this.completedPairs = 0;
        this.generateNewRound();
    }
    
    restart() {
        this.completedPairs = 0;
        super.restart();
    }
}

// Add CSS for Fact Family Farm
const factFamilyFarmCSS = `
<style>
.factfarm-container {
    max-width: 900px;
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
    background: var(--accent-color);
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 25px;
    font-weight: bold;
    font-size: 1.5rem;
    margin-left: 0.5rem;
}

.farm-layout {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    margin-bottom: 2rem;
}

.barn-section, .field-section {
    text-align: center;
}

.barn-title, .field-title {
    font-size: 1.5rem;
    font-weight: bold;
    color: var(--primary-color);
    margin-bottom: 1rem;
    font-family: var(--font-primary);
}

.barn {
    background: linear-gradient(145deg, #8B4513, #A0522D);
    border: 4px solid #654321;
    border-radius: 20px 20px 10px 10px;
    padding: 1.5rem;
    min-height: 300px;
    position: relative;
    box-shadow: var(--shadow);
    transition: all 0.3s ease;
}

.barn.success-glow {
    box-shadow: 0 0 20px var(--success-color);
    animation: pulse 0.6s ease-in-out;
}

.barn.shake {
    animation: shake 0.6s ease-in-out;
}

.barn-target {
    background: var(--card-background);
    border: 3px solid var(--primary-color);
    border-radius: 50%;
    width: 80px;
    height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1rem;
    position: relative;
}

.barn-target::before {
    content: '🎯';
    position: absolute;
    top: -10px;
    right: -10px;
    font-size: 1.5rem;
}

.barn-number {
    font-size: 2rem;
    font-weight: bold;
    color: var(--primary-color);
}

.barn-animals {
    min-height: 120px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    padding: 10px;
    margin-bottom: 1rem;
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    justify-content: center;
    align-items: center;
}

.barn-sum {
    background: var(--card-background);
    padding: 0.5rem 1rem;
    border-radius: 15px;
    font-weight: bold;
    color: var(--text-color);
}

.field {
    background: linear-gradient(145deg, #90EE90, #98FB98);
    border: 4px solid #228B22;
    border-radius: 15px;
    padding: 1.5rem;
    min-height: 300px;
    display: flex;
    flex-wrap: wrap;
    gap: 15px;
    justify-content: center;
    align-content: flex-start;
    box-shadow: var(--shadow);
    position: relative;
}

.field::before {
    content: '🌾';
    position: absolute;
    top: 10px;
    left: 10px;
    font-size: 1.5rem;
    opacity: 0.7;
}

.field::after {
    content: '🌻';
    position: absolute;
    bottom: 10px;
    right: 10px;
    font-size: 1.5rem;
    opacity: 0.7;
}

.animal {
    background: var(--card-background);
    border: 3px solid var(--border-color);
    border-radius: 15px;
    padding: 10px;
    cursor: pointer;
    transition: all 0.3s ease;
    user-select: none;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    min-width: 60px;
    text-align: center;
}

.field-animal {
    cursor: grab;
}

.field-animal:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}

.field-animal:active,
.field-animal.dragging {
    transform: scale(1.1);
    cursor: grabbing;
    z-index: 1000;
    opacity: 0.8;
}

.barn-animal {
    background: linear-gradient(145deg, #FFE4B5, #FFEFD5);
    border-color: var(--accent-color);
}

.animal-emoji {
    font-size: 1.8rem;
    margin-bottom: 5px;
}

.animal-number {
    font-weight: bold;
    font-size: 1.2rem;
    color: var(--text-color);
}

.pairs-completed {
    text-align: center;
    font-size: 1.2rem;
    font-weight: bold;
    color: var(--primary-color);
    margin-bottom: 1rem;
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

.floating-heart {
    position: absolute;
    font-size: 1.5rem;
    animation: floatUp 2s ease-out forwards;
    pointer-events: none;
    z-index: 100;
}

@keyframes floatUp {
    0% {
        bottom: 50%;
        opacity: 1;
        transform: translateY(0) scale(1);
    }
    100% {
        bottom: 90%;
        opacity: 0;
        transform: translateY(-50px) scale(1.5);
    }
}

/* Drag over states */
.barn:hover {
    background: linear-gradient(145deg, #A0522D, #8B4513);
}

.field:hover {
    background: linear-gradient(145deg, #98FB98, #90EE90);
}

@media (max-width: 768px) {
    .farm-layout {
        grid-template-columns: 1fr;
        gap: 1.5rem;
    }
    
    .barn, .field {
        min-height: 250px;
        padding: 1rem;
    }
    
    .animal {
        min-width: 50px;
        padding: 8px;
    }
    
    .animal-emoji {
        font-size: 1.5rem;
    }
    
    .animal-number {
        font-size: 1rem;
    }
    
    .barn-target {
        width: 60px;
        height: 60px;
    }
    
    .barn-number {
        font-size: 1.5rem;
    }
    
    .target-number {
        font-size: 1.2rem;
        padding: 0.3rem 0.8rem;
    }
}

@media (max-width: 480px) {
    .instructions {
        font-size: 1.1rem;
    }
    
    .barn, .field {
        min-height: 200px;
        padding: 0.8rem;
    }
    
    .animal {
        min-width: 45px;
        padding: 6px;
    }
    
    .animal-emoji {
        font-size: 1.3rem;
    }
    
    .animal-number {
        font-size: 0.9rem;
    }
}

/* Touch device optimizations */
@media (hover: none) and (pointer: coarse) {
    .animal {
        min-width: 70px;
        padding: 12px;
    }
    
    .field-animal:hover {
        transform: none;
    }
    
    .field-animal:active {
        transform: scale(1.05);
    }
}
</style>
`;

// Inject CSS
document.head.insertAdjacentHTML('beforeend', factFamilyFarmCSS);