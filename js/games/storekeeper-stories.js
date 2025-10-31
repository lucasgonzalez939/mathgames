// Storekeeper Stories Game
class StorekeeperStories extends BaseGame {
    constructor(container) {
        super(container);
        this.gameType = 'storekeeper-stories';
        this.currentProblem = null;
        this.selectedOperator = null;
        this.userAnswer = null;
        this.currentStep = 'chooseOperation';
        this.problems = this.generateProblemSet();
        this.currentProblemIndex = 0;
    }
    
    getTitleKey() {
        return 'game-6-title';
    }
    
    setupGame() {
        const gameArea = document.getElementById('gameArea');
        gameArea.innerHTML = `
            <div class="storekeeper-container">
                <div class="instructions" data-i18n="storekeeper-instructions">Read the story and solve the math problem!</div>
                
                <div class="story-section">
                    <div class="story-header">
                        <div class="storekeeper-avatar">👨‍💼</div>
                        <div class="store-name">Math Mart</div>
                    </div>
                    
                    <div class="story-text" id="storyText">
                        <!-- Story will be populated here -->
                    </div>
                    
                    <div class="story-visual" id="storyVisual">
                        <!-- Visual representation will be here -->
                    </div>
                </div>
                
                <div class="equation-builder" id="equationBuilder">
                    <div class="equation-display">
                        <span class="number-box" id="firstNumber">?</span>
                        <span class="operator-box" id="operatorBox">
                            <span class="placeholder">?</span>
                        </span>
                        <span class="number-box" id="secondNumber">?</span>
                        <span class="equals">=</span>
                        <input type="number" class="answer-input" id="answerInput" placeholder="?" disabled>
                    </div>
                    
                    <div class="operation-choices" id="operationChoices">
                        <div class="instruction-text" data-i18n="storekeeper-choose-operation">Choose the operation</div>
                        <button class="operator-btn" data-operator="+" id="addBtn">
                            <span class="operator-symbol">+</span>
                            <span class="operator-name" data-i18n="addition">Addition</span>
                        </button>
                        <button class="operator-btn" data-operator="-" id="subtractBtn">
                            <span class="operator-symbol">−</span>
                            <span class="operator-name" data-i18n="subtraction">Subtraction</span>
                        </button>
                    </div>
                    
                    <div class="answer-section" id="answerSection" style="display: none;">
                        <div class="instruction-text" data-i18n="storekeeper-enter-answer">Enter your answer</div>
                        <button class="btn" id="checkAnswerBtn" disabled data-i18n="check-answer">Check Answer</button>
                    </div>
                </div>
                
                <div class="progress-info">
                    <span data-i18n="problem">Problem</span> <span id="problemNumber">1</span> of <span id="totalProblems">5</span>
                </div>
                
                <div class="feedback" id="feedback"></div>
            </div>
        `;
        
        this.loadCurrentProblem();
        this.setupEventListeners();
        
        // Retranslate after adding content
        if (typeof i18n !== 'undefined') {
            i18n.translatePage();
        }
    }
    
    generateProblemSet() {
        const problems = {
            easy: [
                {
                    story: "Sarah has 5 apples. Her friend gives her 3 more apples. How many apples does Sarah have now?",
                    storyEs: "Sarah tiene 5 manzanas. Su amiga le da 3 manzanas más. ¿Cuántas manzanas tiene Sarah ahora?",
                    a: 5, b: 3, operator: '+', answer: 8,
                    visual: { type: 'apples', initial: 5, change: 3, operation: 'add' }
                },
                {
                    story: "Tom bought 8 toy cars. He gave 2 cars to his brother. How many cars does Tom have left?",
                    storyEs: "Tom compró 8 carritos de juguete. Le dio 2 carritos a su hermano. ¿Cuántos carritos le quedan a Tom?",
                    a: 8, b: 2, operator: '-', answer: 6,
                    visual: { type: 'cars', initial: 8, change: 2, operation: 'remove' }
                },
                {
                    story: "Emma has 4 stickers. She buys 6 more stickers at the store. How many stickers does Emma have in total?",
                    storyEs: "Emma tiene 4 calcomanías. Compra 6 calcomanías más en la tienda. ¿Cuántas calcomanías tiene Emma en total?",
                    a: 4, b: 6, operator: '+', answer: 10,
                    visual: { type: 'stickers', initial: 4, change: 6, operation: 'add' }
                },
                {
                    story: "Jake had 9 cookies. He ate 4 cookies for lunch. How many cookies are left?",
                    storyEs: "Jake tenía 9 galletas. Se comió 4 galletas en el almuerzo. ¿Cuántas galletas quedan?",
                    a: 9, b: 4, operator: '-', answer: 5,
                    visual: { type: 'cookies', initial: 9, change: 4, operation: 'remove' }
                },
                {
                    story: "Lisa collects 7 seashells on the beach. Then she finds 2 more beautiful seashells. How many seashells does she have?",
                    storyEs: "Lisa recolecta 7 caracolas en la playa. Luego encuentra 2 caracolas hermosas más. ¿Cuántas caracolas tiene?",
                    a: 7, b: 2, operator: '+', answer: 9,
                    visual: { type: 'shells', initial: 7, change: 2, operation: 'add' }
                }
            ],
            medium: [
                {
                    story: "The bakery had 25 cupcakes in the morning. They sold 18 cupcakes during the day. How many cupcakes are left?",
                    storyEs: "La panadería tenía 25 pastelitos en la mañana. Vendieron 18 pastelitos durante el día. ¿Cuántos pastelitos quedan?",
                    a: 25, b: 18, operator: '-', answer: 7,
                    visual: { type: 'cupcakes', initial: 25, change: 18, operation: 'remove' }
                },
                {
                    story: "A farmer has 14 chickens and buys 12 more chickens. How many chickens does the farmer have now?",
                    storyEs: "Un granjero tiene 14 pollos y compra 12 pollos más. ¿Cuántos pollos tiene el granjero ahora?",
                    a: 14, b: 12, operator: '+', answer: 26,
                    visual: { type: 'chickens', initial: 14, change: 12, operation: 'add' }
                },
                {
                    story: "There were 31 books on the shelf. The librarian took away 15 books. How many books remain on the shelf?",
                    storyEs: "Había 31 libros en el estante. El bibliotecario se llevó 15 libros. ¿Cuántos libros quedan en el estante?",
                    a: 31, b: 15, operator: '-', answer: 16,
                    visual: { type: 'books', initial: 31, change: 15, operation: 'remove' }
                },
                {
                    story: "Maria saved 23 coins in her piggy bank. Her grandmother gave her 19 more coins. How many coins does Maria have?",
                    storyEs: "María ahorró 23 monedas en su alcancía. Su abuela le dio 19 monedas más. ¿Cuántas monedas tiene María?",
                    a: 23, b: 19, operator: '+', answer: 42,
                    visual: { type: 'coins', initial: 23, change: 19, operation: 'add' }
                },
                {
                    story: "The pet store had 45 fish. They sold 27 fish to customers. How many fish are still in the store?",
                    storyEs: "La tienda de mascotas tenía 45 peces. Vendieron 27 peces a los clientes. ¿Cuántos peces quedan en la tienda?",
                    a: 45, b: 27, operator: '-', answer: 18,
                    visual: { type: 'fish', initial: 45, change: 27, operation: 'remove' }
                }
            ],
            hard: [
                {
                    story: "A toy store received 125 puzzles in the morning and 67 more puzzles in the afternoon. How many puzzles did they receive in total?",
                    storyEs: "Una juguetería recibió 125 rompecabezas en la mañana y 67 rompecabezas más en la tarde. ¿Cuántos rompecabezas recibieron en total?",
                    a: 125, b: 67, operator: '+', answer: 192,
                    visual: { type: 'puzzles', initial: 125, change: 67, operation: 'add' }
                },
                {
                    story: "The school cafeteria prepared 250 sandwiches. By the end of lunch, 186 sandwiches were eaten. How many sandwiches were not eaten?",
                    storyEs: "La cafetería de la escuela preparó 250 sándwiches. Al final del almuerzo, se comieron 186 sándwiches. ¿Cuántos sándwiches no se comieron?",
                    a: 250, b: 186, operator: '-', answer: 64,
                    visual: { type: 'sandwiches', initial: 250, change: 186, operation: 'remove' }
                },
                {
                    story: "A farmer harvested 89 pumpkins from one field and 56 pumpkins from another field. How many pumpkins did he harvest altogether?",
                    storyEs: "Un granjero cosechó 89 calabazas de un campo y 56 calabazas de otro campo. ¿Cuántas calabazas cosechó en total?",
                    a: 89, b: 56, operator: '+', answer: 145,
                    visual: { type: 'pumpkins', initial: 89, change: 56, operation: 'add' }
                },
                {
                    story: "The movie theater sold 324 tickets for the evening show. 78 people didn't show up. How many people actually watched the movie?",
                    storyEs: "El cine vendió 324 boletos para la función de la noche. 78 personas no llegaron. ¿Cuántas personas vieron realmente la película?",
                    a: 324, b: 78, operator: '-', answer: 246,
                    visual: { type: 'tickets', initial: 324, change: 78, operation: 'remove' }
                },
                {
                    story: "A delivery truck carried 156 packages in the first trip and 198 packages in the second trip. How many packages were delivered in both trips?",
                    storyEs: "Un camión de reparto llevó 156 paquetes en el primer viaje y 198 paquetes en el segundo viaje. ¿Cuántos paquetes se entregaron en ambos viajes?",
                    a: 156, b: 198, operator: '+', answer: 354,
                    visual: { type: 'packages', initial: 156, change: 198, operation: 'add' }
                }
            ]
        };
        
        return problems[this.difficulty] || problems.easy;
    }
    
    loadCurrentProblem() {
        if (this.currentProblemIndex >= this.problems.length) {
            this.completeRound();
            return;
        }
        
        this.currentProblem = this.problems[this.currentProblemIndex];
        this.currentStep = 'chooseOperation';
        this.selectedOperator = null;
        this.userAnswer = null;
        
        this.updateDisplay();
        this.resetEquationBuilder();
        // Start timing for this story problem
        this.startProblem();
    }
    
    updateDisplay() {
        // Update story text
        const currentLang = i18n.getCurrentLanguage();
        const storyText = currentLang === 'es' ? this.currentProblem.storyEs : this.currentProblem.story;
        document.getElementById('storyText').textContent = storyText;
        
        // Update progress
        document.getElementById('problemNumber').textContent = this.currentProblemIndex + 1;
        document.getElementById('totalProblems').textContent = this.problems.length;
        
        // Update equation numbers
        document.getElementById('firstNumber').textContent = this.currentProblem.a;
        document.getElementById('secondNumber').textContent = this.currentProblem.b;
        
        // Create visual representation
        this.createVisualRepresentation();
    }
    
    createVisualRepresentation() {
        const visual = this.currentProblem.visual;
        const container = document.getElementById('storyVisual');
        container.innerHTML = '';
        
        const visualDiv = document.createElement('div');
        visualDiv.className = 'visual-representation';
        
        // Get emoji for the item type
        const itemEmojis = {
            apples: '🍎', cars: '🚗', stickers: '⭐', cookies: '🍪', shells: '🐚',
            cupcakes: '🧁', chickens: '🐔', books: '📚', coins: '🪙', fish: '🐠',
            puzzles: '🧩', sandwiches: '🥪', pumpkins: '🎃', tickets: '🎫', packages: '📦'
        };
        
        const emoji = itemEmojis[visual.type] || '⭐';
        
        // Initial items
        let content = `<div class="visual-group initial-group">`;
        const displayCount = Math.min(visual.initial, 15); // Limit display for large numbers
        for (let i = 0; i < displayCount; i++) {
            content += `<span class="visual-item">${emoji}</span>`;
        }
        if (visual.initial > 15) {
            content += `<span class="item-count">+${visual.initial - 15} more</span>`;
        }
        content += `</div>`;
        
        // Operation indicator
        if (visual.operation === 'add') {
            content += `<div class="operation-indicator">+</div>`;
        } else {
            content += `<div class="operation-indicator">−</div>`;
        }
        
        // Change items
        content += `<div class="visual-group change-group ${visual.operation}">`;
        const changeDisplayCount = Math.min(visual.change, 10);
        for (let i = 0; i < changeDisplayCount; i++) {
            content += `<span class="visual-item">${emoji}</span>`;
        }
        if (visual.change > 10) {
            content += `<span class="item-count">+${visual.change - 10} more</span>`;
        }
        content += `</div>`;
        
        visualDiv.innerHTML = content;
        container.appendChild(visualDiv);
    }
    
    resetEquationBuilder() {
        document.getElementById('operatorBox').innerHTML = '<span class="placeholder">?</span>';
        document.getElementById('answerInput').value = '';
        document.getElementById('answerInput').disabled = true;
        
        document.getElementById('operationChoices').style.display = 'block';
        document.getElementById('answerSection').style.display = 'none';
        
        // Reset operator buttons
        document.querySelectorAll('.operator-btn').forEach(btn => {
            btn.classList.remove('selected');
            btn.disabled = false;
        });
        
        document.getElementById('checkAnswerBtn').disabled = true;
    }
    
    setupEventListeners() {
        const addBtn = document.getElementById('addBtn');
        const subtractBtn = document.getElementById('subtractBtn');
        const answerInput = document.getElementById('answerInput');
        const checkAnswerBtn = document.getElementById('checkAnswerBtn');
        
        addBtn.addEventListener('click', () => this.selectOperator('+'));
        subtractBtn.addEventListener('click', () => this.selectOperator('-'));
        
        answerInput.addEventListener('input', () => {
            this.userAnswer = parseInt(answerInput.value);
            checkAnswerBtn.disabled = !answerInput.value;
        });
        
        answerInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && answerInput.value) {
                this.checkAnswer();
            }
        });
        
        checkAnswerBtn.addEventListener('click', () => this.checkAnswer());
    }
    
    selectOperator(operator) {
        this.selectedOperator = operator;
        
        // Update operator display
        document.getElementById('operatorBox').innerHTML = `<span class="selected-operator">${operator}</span>`;
        
        // Mark selected button
        document.querySelectorAll('.operator-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        document.querySelector(`[data-operator="${operator}"]`).classList.add('selected');
        
        // Check if correct operator
        if (operator === this.currentProblem.operator) {
            this.playSound('correct');
            this.proceedToAnswerStep();
        } else {
            this.playSound('wrong');
            this.showOperatorFeedback(false);
        }
    }
    
    proceedToAnswerStep() {
        this.currentStep = 'chooseAnswer';
        
        // Hide operation choices, show answer section
        document.getElementById('operationChoices').style.display = 'none';
        document.getElementById('answerSection').style.display = 'block';
        
        // Enable answer input
        const answerInput = document.getElementById('answerInput');
        answerInput.disabled = false;
        answerInput.focus();
        
        // Disable operator buttons
        document.querySelectorAll('.operator-btn').forEach(btn => {
            btn.disabled = true;
        });
        
        this.showOperatorFeedback(true);
    }
    
    showOperatorFeedback(isCorrect) {
        const feedback = document.getElementById('feedback');
        if (isCorrect) {
            feedback.innerHTML = `<div class="success-message">${i18n.get('correct-operation')}</div>`;
            feedback.className = 'feedback success';
        } else {
            feedback.innerHTML = `<div class="error-message">${i18n.get('wrong-operation')}</div>`;
            feedback.className = 'feedback error';
            
            // Reset operator selection after delay
            setTimeout(() => {
                document.getElementById('operatorBox').innerHTML = '<span class="placeholder">?</span>';
                document.querySelectorAll('.operator-btn').forEach(btn => {
                    btn.classList.remove('selected');
                });
                this.selectedOperator = null;
                feedback.className = 'feedback';
                feedback.innerHTML = '';
            }, 1500);
        }
    }
    
    checkAnswer() {
        if (this.userAnswer === this.currentProblem.answer) {
            this.onCorrectAnswer();
        } else {
            this.onWrongAnswer();
        }
    }
    
    onCorrectAnswer() {
        this.playSound('success');
        
        // Update equation display with correct answer
        const answerInput = document.getElementById('answerInput');
        answerInput.style.background = 'var(--success-color)';
        answerInput.style.color = 'white';
        answerInput.disabled = true;
        
        // Show success feedback
        const feedback = document.getElementById('feedback');
        feedback.innerHTML = `
            <div class="complete-success">
                <div class="celebration">🎉</div>
                <div class="success-text" data-i18n="correct">Correct!</div>
                <div class="equation-summary">${this.currentProblem.a} ${this.currentProblem.operator} ${this.currentProblem.b} = ${this.currentProblem.answer}</div>
            </div>
        `;
        feedback.className = 'feedback success';
        
        // Award points
        this.updateScore(30 * this.level);
    // Record achievement progress for solving a story problem
    this.recordCorrectAnswer();
        
        // Move to next problem after delay
        setTimeout(() => {
            this.currentProblemIndex++;
            this.loadCurrentProblem();
            feedback.className = 'feedback';
            feedback.innerHTML = '';
        }, 3000);
        
        // Retranslate
        if (typeof i18n !== 'undefined') {
            i18n.translatePage();
        }
    }
    
    onWrongAnswer() {
        this.playSound('wrong');
        
        const answerInput = document.getElementById('answerInput');
        answerInput.classList.add('wrong');
        answerInput.value = '';
        this.userAnswer = null;
        document.getElementById('checkAnswerBtn').disabled = true;
        
        const feedback = document.getElementById('feedback');
        feedback.innerHTML = `<div class="error-message">${i18n.get('wrong-answer-storekeeper')}</div>`;
        feedback.className = 'feedback error';
    // Record incorrect attempt for achievements/streaks
    this.recordIncorrectAnswer();
        
        setTimeout(() => {
            answerInput.classList.remove('wrong');
            feedback.className = 'feedback';
            feedback.innerHTML = '';
        }, 2000);
    }
    
    completeRound() {
        const feedback = document.getElementById('feedback');
        feedback.innerHTML = `
            <div class="round-complete">
                <div class="celebration">🏆</div>
                <div class="completion-text">${i18n.get('story-problems-complete')}</div>
                <div class="score-info">${i18n.get('score')}: ${30 * this.problems.length * this.level}</div>
            </div>
        `;
        feedback.className = 'feedback success';
        
        if (this.score > 0 && this.score % 150 === 0) {
            this.updateLevel();
        }
        
        setTimeout(() => {
            this.currentProblemIndex = 0;
            this.problems = this.generateProblemSet();
            this.loadCurrentProblem();
            feedback.className = 'feedback';
            feedback.innerHTML = '';
        }, 4000);
    }
    
    onDifficultyChange() {
        this.currentProblemIndex = 0;
        this.problems = this.generateProblemSet();
        this.loadCurrentProblem();
    }
    
    restart() {
        this.currentProblemIndex = 0;
        this.problems = this.generateProblemSet();
        super.restart();
    }
}

// Add CSS for Storekeeper Stories
const storekeeperStoriesCSS = `
<style>
.storekeeper-container {
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

.story-section {
    background: var(--card-background);
    border: 3px solid var(--border-color);
    border-radius: 20px;
    padding: 2rem;
    margin-bottom: 2rem;
    box-shadow: var(--shadow);
}

.story-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 2px solid var(--border-color);
}

.storekeeper-avatar {
    font-size: 3rem;
    background: var(--primary-color);
    color: white;
    width: 80px;
    height: 80px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: var(--shadow);
}

.store-name {
    font-family: var(--font-primary);
    font-size: 2rem;
    color: var(--primary-color);
}

.story-text {
    font-size: 1.3rem;
    line-height: 1.6;
    color: var(--text-color);
    margin-bottom: 1.5rem;
    background: var(--background-color);
    padding: 1.5rem;
    border-radius: 15px;
    border-left: 5px solid var(--accent-color);
}

.visual-representation {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    flex-wrap: wrap;
    padding: 1rem;
    background: var(--background-color);
    border-radius: 15px;
}

.visual-group {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    align-items: center;
    padding: 10px;
    border-radius: 10px;
}

.initial-group {
    background: rgba(76, 175, 80, 0.1);
    border: 2px dashed var(--success-color);
}

.change-group.add {
    background: rgba(33, 150, 243, 0.1);
    border: 2px dashed var(--secondary-color);
}

.change-group.remove {
    background: rgba(244, 67, 54, 0.1);
    border: 2px dashed var(--error-color);
    opacity: 0.6;
}

.visual-item {
    font-size: 1.5rem;
    margin: 2px;
    display: inline-block;
    animation: popIn 0.3s ease-out;
}

.item-count {
    background: var(--text-light);
    color: white;
    padding: 2px 8px;
    border-radius: 10px;
    font-size: 0.8rem;
    font-weight: bold;
}

.operation-indicator {
    font-size: 2rem;
    font-weight: bold;
    color: var(--accent-color);
    background: var(--card-background);
    width: 50px;
    height: 50px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 3px solid var(--accent-color);
}

@keyframes popIn {
    from {
        transform: scale(0);
        opacity: 0;
    }
    to {
        transform: scale(1);
        opacity: 1;
    }
}

.equation-builder {
    background: var(--card-background);
    border: 3px solid var(--border-color);
    border-radius: 20px;
    padding: 2rem;
    margin-bottom: 2rem;
    box-shadow: var(--shadow);
}

.equation-display {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    margin-bottom: 2rem;
    font-size: 2rem;
    font-family: 'Courier New', monospace;
}

.number-box {
    background: var(--success-color);
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 15px;
    font-weight: bold;
    min-width: 80px;
    text-align: center;
    box-shadow: var(--shadow);
}

.operator-box {
    background: var(--background-color);
    border: 3px dashed var(--border-color);
    padding: 1rem 1.5rem;
    border-radius: 15px;
    min-width: 80px;
    text-align: center;
    transition: all 0.3s ease;
}

.operator-box .placeholder {
    color: var(--text-light);
    font-size: 2rem;
}

.operator-box .selected-operator {
    color: var(--accent-color);
    font-weight: bold;
    font-size: 2rem;
}

.equals {
    font-weight: bold;
    color: var(--text-color);
}

.answer-input {
    background: var(--background-color);
    border: 3px solid var(--border-color);
    padding: 1rem 1.5rem;
    border-radius: 15px;
    font-size: 2rem;
    font-family: 'Courier New', monospace;
    text-align: center;
    min-width: 80px;
    transition: all 0.3s ease;
}

.answer-input:focus {
    border-color: var(--primary-color);
    outline: none;
    box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.2);
}

.answer-input:disabled {
    background: var(--border-color);
    cursor: not-allowed;
}

.answer-input.wrong {
    background: var(--error-color);
    color: white;
    animation: shake 0.6s ease-in-out;
}

.operation-choices {
    text-align: center;
}

.instruction-text {
    font-size: 1.2rem;
    font-weight: bold;
    color: var(--primary-color);
    margin-bottom: 1.5rem;
}

.operator-btn {
    background: var(--card-background);
    border: 3px solid var(--border-color);
    border-radius: 15px;
    padding: 1.5rem;
    margin: 0 1rem;
    cursor: pointer;
    transition: all 0.3s ease;
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    min-width: 120px;
}

.operator-btn:hover {
    border-color: var(--primary-color);
    transform: translateY(-3px);
    box-shadow: var(--shadow-hover);
}

.operator-btn.selected {
    background: var(--accent-color);
    color: white;
    border-color: var(--accent-color);
}

.operator-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
}

.operator-symbol {
    font-size: 2rem;
    font-weight: bold;
}

.operator-name {
    font-size: 1rem;
    font-weight: 600;
}

.answer-section {
    text-align: center;
}

.progress-info {
    text-align: center;
    font-size: 1.1rem;
    font-weight: bold;
    color: var(--primary-color);
    margin-bottom: 1rem;
}

.feedback {
    text-align: center;
    padding: 1.5rem;
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

.complete-success {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
}

.celebration {
    font-size: 3rem;
}

.success-text {
    font-size: 1.5rem;
}

.equation-summary {
    font-family: 'Courier New', monospace;
    font-size: 1.2rem;
    background: rgba(255, 255, 255, 0.2);
    padding: 0.5rem 1rem;
    border-radius: 10px;
}

.round-complete {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
}

.completion-text {
    font-size: 1.3rem;
}

.score-info {
    font-size: 1.1rem;
    color: rgba(255, 255, 255, 0.9);
}

@media (max-width: 768px) {
    .story-header {
        flex-direction: column;
        text-align: center;
    }
    
    .storekeeper-avatar {
        width: 60px;
        height: 60px;
        font-size: 2rem;
    }
    
    .store-name {
        font-size: 1.5rem;
    }
    
    .story-text {
        font-size: 1.1rem;
        padding: 1rem;
    }
    
    .equation-display {
        font-size: 1.5rem;
        gap: 0.5rem;
        flex-wrap: wrap;
    }
    
    .number-box, .operator-box, .answer-input {
        padding: 0.8rem 1rem;
        min-width: 60px;
        font-size: 1.5rem;
    }
    
    .operator-btn {
        margin: 0.5rem;
        padding: 1rem;
        min-width: 100px;
    }
    
    .visual-item {
        font-size: 1.2rem;
    }
}

@media (max-width: 480px) {
    .instructions {
        font-size: 1.1rem;
    }
    
    .story-text {
        font-size: 1rem;
    }
    
    .equation-display {
        font-size: 1.2rem;
    }
    
    .number-box, .operator-box, .answer-input {
        padding: 0.6rem 0.8rem;
        font-size: 1.2rem;
        min-width: 50px;
    }
    
    .operator-btn {
        padding: 0.8rem;
        min-width: 80px;
    }
    
    .operator-symbol {
        font-size: 1.5rem;
    }
    
    .operator-name {
        font-size: 0.9rem;
    }
}

/* Touch device optimizations */
@media (hover: none) and (pointer: coarse) {
    .operator-btn {
        min-height: 80px;
        padding: 1.5rem;
    }
    
    .operator-btn:hover {
        transform: none;
    }
    
    .operator-btn:active {
        transform: scale(0.95);
    }
}
</style>
`;

// Inject CSS
document.head.insertAdjacentHTML('beforeend', storekeeperStoriesCSS);