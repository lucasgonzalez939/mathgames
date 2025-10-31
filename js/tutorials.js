// Tutorial System for Math Games
class TutorialSystem {
    constructor() {
        this.currentTutorial = null;
        this.currentStep = 0;
        this.tutorialActive = false;
        this.completedTutorials = this.loadCompletedTutorials();
        this.overlay = null;
        this.highlightBox = null;
        this.tutorialBox = null;
        
        // Define tutorials for each game
        this.tutorials = {
            'number-line-leap': this.getNumberLineTutorial(),
            'math-stacker': this.getMathStackerTutorial(),
            'operation-pop': this.getOperationPopTutorial(),
            'fact-family-farm': this.getFactFamilyTutorial(),
            'place-value-puzzles': this.getPlaceValueTutorial(),
            'storekeeper-stories': this.getStorekeeperTutorial(),
            'pattern-painter': this.getPatternTutorial()
        };
    }
    
    // Check if tutorial should be shown
    shouldShowTutorial(gameType) {
        return !this.completedTutorials[gameType];
    }
    
    // Start tutorial for a specific game
    startTutorial(gameType) {
        if (!this.tutorials[gameType]) {
            console.warn('No tutorial defined for game:', gameType);
            return;
        }
        
        this.currentTutorial = this.tutorials[gameType];
        this.currentStep = 0;
        this.tutorialActive = true;
        
        this.createOverlay();
        this.showStep(0);
    }
    
    // Create dark overlay and tutorial elements
    createOverlay() {
        // Create overlay
        this.overlay = document.createElement('div');
        this.overlay.className = 'tutorial-overlay';
        this.overlay.id = 'tutorialOverlay';
        
        // Create highlight box (spotlight effect)
        this.highlightBox = document.createElement('div');
        this.highlightBox.className = 'tutorial-highlight';
        this.highlightBox.id = 'tutorialHighlight';
        
        // Create tutorial box (instructions)
        this.tutorialBox = document.createElement('div');
        this.tutorialBox.className = 'tutorial-box';
        this.tutorialBox.id = 'tutorialBox';
        
        document.body.appendChild(this.overlay);
        document.body.appendChild(this.highlightBox);
        document.body.appendChild(this.tutorialBox);
        
        // Fade in
        setTimeout(() => {
            this.overlay.classList.add('show');
        }, 10);
    }
    
    // Show a specific tutorial step
    showStep(stepIndex) {
        if (!this.currentTutorial || stepIndex >= this.currentTutorial.steps.length) {
            this.completeTutorial();
            return;
        }
        
        this.currentStep = stepIndex;
        const step = this.currentTutorial.steps[stepIndex];
        
        // Get language
        const lang = i18n ? i18n.currentLanguage : 'en';
        
        // Highlight element if specified
        if (step.target) {
            this.highlightElement(step.target, step.position);
        } else {
            this.highlightBox.style.display = 'none';
        }
        
        // Update tutorial box
        this.tutorialBox.innerHTML = `
            <div class="tutorial-header">
                <div class="tutorial-icon">${step.icon}</div>
                <div class="tutorial-title">${step.title[lang]}</div>
            </div>
            <div class="tutorial-content">
                <div class="tutorial-text">${step.text[lang]}</div>
                ${step.image ? `<div class="tutorial-image">${step.image}</div>` : ''}
            </div>
            <div class="tutorial-footer">
                <div class="tutorial-progress">
                    <span data-i18n="step">Step</span> ${stepIndex + 1} / ${this.currentTutorial.steps.length}
                    <div class="progress-dots">
                        ${this.currentTutorial.steps.map((_, i) => 
                            `<span class="dot ${i === stepIndex ? 'active' : ''} ${i < stepIndex ? 'completed' : ''}"></span>`
                        ).join('')}
                    </div>
                </div>
                <div class="tutorial-buttons">
                    <button class="tutorial-btn skip-btn" id="skipTutorial" data-i18n="skip-tutorial">Skip Tutorial</button>
                    ${stepIndex > 0 ? '<button class="tutorial-btn back-btn" id="backStep" data-i18n="back">Back</button>' : ''}
                    <button class="tutorial-btn next-btn" id="nextStep">
                        ${stepIndex < this.currentTutorial.steps.length - 1 ? 
                            '<span data-i18n="next">Next</span>' : 
                            '<span data-i18n="got-it">Got it!</span>'}
                    </button>
                </div>
            </div>
        `;
        
        // Position tutorial box
        this.positionTutorialBox(step.boxPosition || 'bottom');
        
        // Reposition on resize/rotation
        if (this._onResize) {
            window.removeEventListener('resize', this._onResize);
            window.removeEventListener('scroll', this._onResize, true);
        }
        this._onResize = () => this.positionTutorialBox(step.boxPosition || 'bottom');
        window.addEventListener('resize', this._onResize);
        window.addEventListener('scroll', this._onResize, true);
        
        // Animate in
        this.tutorialBox.classList.add('show');
        
        // Add event listeners
        this.setupStepListeners();
        
        // Translate
        if (typeof i18n !== 'undefined') {
            i18n.translatePage();
        }
        
        // Execute step action if any
        if (step.action) {
            setTimeout(() => step.action(), 100);
        }
    }
    
    // Highlight a specific element
    highlightElement(selector, position = 'center') {
        const element = document.querySelector(selector);
        if (!element) {
            this.highlightBox.style.display = 'none';
            return;
        }
        
        // Ensure the target is in view first
        try {
            element.scrollIntoView({ block: 'center', inline: 'center', behavior: 'instant' });
        } catch (_) {}
        
        const rect = element.getBoundingClientRect();
        const padding = 20;
        
        this.highlightBox.style.display = 'block';
        this.highlightBox.style.left = (rect.left - padding) + 'px';
        this.highlightBox.style.top = (rect.top - padding) + 'px';
        this.highlightBox.style.width = (rect.width + padding * 2) + 'px';
        this.highlightBox.style.height = (rect.height + padding * 2) + 'px';
        
        // Bring element to front
        element.style.position = 'relative';
        element.style.zIndex = '9999';
        
        // Pulse animation
        this.highlightBox.classList.remove('pulse');
        setTimeout(() => this.highlightBox.classList.add('pulse'), 10);
    }
    
    // Position tutorial box relative to highlighted element
    positionTutorialBox(position) {
        const highlight = this.highlightBox;
        const box = this.tutorialBox;
        const margin = 16; // viewport margin to keep box inside
        const vw = window.innerWidth;
        const vh = window.innerHeight;

        if (highlight.style.display === 'none' || position === 'center') {
            // Center on screen
            box.style.position = 'fixed';
            box.style.left = '50%';
            box.style.top = '50%';
            box.style.transform = 'translate(-50%, -50%)';
            box.dataset.arrow = '';
            // Constrain size
            box.style.maxHeight = Math.floor(vh * 0.8) + 'px';
            box.style.overflow = 'auto';
            return;
        }
        
        const highlightRect = highlight.getBoundingClientRect();
        const spacing = 20;
        
        box.style.position = 'fixed';
        box.style.transform = 'none';
        let desiredLeft = highlightRect.left;
        let desiredTop = highlightRect.bottom + spacing;
        let arrow = 'top';

        if (position === 'top') {
            desiredTop = Math.max(margin, highlightRect.top - spacing); // will adjust later using bottom prop
            arrow = 'bottom';
        } else if (position === 'bottom') {
            desiredTop = highlightRect.bottom + spacing;
            arrow = 'top';
        } else if (position === 'left') {
            desiredLeft = Math.max(margin, highlightRect.left - spacing);
            desiredTop = highlightRect.top;
            arrow = 'right';
        } else if (position === 'right') {
            desiredLeft = highlightRect.right + spacing;
            desiredTop = highlightRect.top;
            arrow = 'left';
        }

        // Tentatively place
        box.style.left = desiredLeft + 'px';
        box.style.top = desiredTop + 'px';
        box.style.right = 'auto';
        box.style.bottom = 'auto';
        box.dataset.arrow = arrow;
        
        // Constrain box within viewport
        const clamp = () => {
            const br = box.getBoundingClientRect();
            // If overflows right, shift left
            if (br.right > vw - margin) {
                const shift = br.right - (vw - margin);
                const newLeft = Math.max(margin, br.left - shift);
                box.style.left = newLeft + 'px';
            }
            // If overflows left, align to margin
            if (br.left < margin) {
                box.style.left = margin + 'px';
            }
            // If overflows bottom, try placing above highlight
            const br2 = box.getBoundingClientRect();
            if (br2.bottom > vh - margin) {
                // Place above
                box.style.top = 'auto';
                box.style.bottom = (vh - highlightRect.top + spacing) + 'px';
                box.dataset.arrow = 'bottom';
            }
            // If overflows top after adjustment, clamp to margin
            const br3 = box.getBoundingClientRect();
            if (br3.top < margin) {
                box.style.top = margin + 'px';
                box.style.bottom = 'auto';
                box.dataset.arrow = '';
            }
            // Constrain height
            box.style.maxHeight = Math.floor(vh * 0.8) + 'px';
            box.style.overflow = 'auto';
        };
        // Wait a tick for layout
        setTimeout(clamp, 0);
    }
    
    // Setup event listeners for tutorial buttons
    setupStepListeners() {
        const nextBtn = document.getElementById('nextStep');
        const backBtn = document.getElementById('backStep');
        const skipBtn = document.getElementById('skipTutorial');
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextStep());
        }
        
        if (backBtn) {
            backBtn.addEventListener('click', () => this.previousStep());
        }
        
        if (skipBtn) {
            skipBtn.addEventListener('click', () => this.skipTutorial());
        }
        
        // Keyboard navigation
        document.addEventListener('keydown', this.handleKeyPress.bind(this));
    }
    
    handleKeyPress(e) {
        if (!this.tutorialActive) return;
        
        if (e.key === 'ArrowRight' || e.key === 'Enter') {
            e.preventDefault();
            this.nextStep();
        } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            this.previousStep();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            this.skipTutorial();
        }
    }
    
    nextStep() {
        this.showStep(this.currentStep + 1);
    }
    
    previousStep() {
        if (this.currentStep > 0) {
            this.showStep(this.currentStep - 1);
        }
    }
    
    skipTutorial() {
        if (confirm(i18n.get('confirm-skip-tutorial') || 'Are you sure you want to skip this tutorial?')) {
            this.completeTutorial(true);
        }
    }
    
    completeTutorial(skipped = false) {
        this.tutorialActive = false;
        
        // Save as completed
        if (this.currentTutorial && this.currentTutorial.gameType) {
            this.completedTutorials[this.currentTutorial.gameType] = true;
            this.saveCompletedTutorials();
        }
        
        // Clean up
        this.cleanup();
        
        // Show completion message if not skipped
        if (!skipped && typeof achievementUI !== 'undefined') {
            achievementUI.showCelebration(i18n.get('tutorial-complete') || 'Tutorial Complete! 🎉');
        }
    }
    
    cleanup() {
        // Remove overlay and elements
        if (this.overlay) {
            this.overlay.classList.remove('show');
            setTimeout(() => {
                if (this.overlay) this.overlay.remove();
                if (this.highlightBox) this.highlightBox.remove();
                if (this.tutorialBox) this.tutorialBox.remove();
                
                // Reset z-index of highlighted elements
                document.querySelectorAll('[style*="z-index: 9999"]').forEach(el => {
                    el.style.zIndex = '';
                });
            }, 300);
        }
        
        // Remove listeners
        if (this._onResize) {
            window.removeEventListener('resize', this._onResize);
            window.removeEventListener('scroll', this._onResize, true);
            this._onResize = null;
        }
        
        this.currentTutorial = null;
        this.currentStep = 0;
    }
    
    // Reset a specific tutorial or all
    resetTutorial(gameType = null) {
        if (gameType) {
            delete this.completedTutorials[gameType];
        } else {
            this.completedTutorials = {};
        }
        this.saveCompletedTutorials();
    }
    
    // Persistence
    loadCompletedTutorials() {
        const data = localStorage.getItem('mathgames_completed_tutorials');
        return data ? JSON.parse(data) : {};
    }
    
    saveCompletedTutorials() {
        localStorage.setItem('mathgames_completed_tutorials', JSON.stringify(this.completedTutorials));
    }
    
    // Tutorial Definitions
    getNumberLineTutorial() {
        return {
            gameType: 'number-line-leap',
            steps: [
                {
                    icon: '👋',
                    title: { 
                        en: 'Welcome to Number Line Leap!', 
                        es: '¡Bienvenido a Salto en la Línea Numérica!' 
                    },
                    text: { 
                        en: 'Help Freddy the Frog solve math problems by jumping on the number line! Let\'s learn how to play.',
                        es: '¡Ayuda a Freddy la Rana a resolver problemas matemáticos saltando en la línea numérica! Aprendamos cómo jugar.'
                    },
                    boxPosition: 'center'
                },
                {
                    icon: '📝',
                    title: { 
                        en: 'The Math Problem', 
                        es: 'El Problema Matemático' 
                    },
                    text: { 
                        en: 'Here you\'ll see the math problem you need to solve. For example: 3 + 5 = ?',
                        es: 'Aquí verás el problema matemático que necesitas resolver. Por ejemplo: 3 + 5 = ?'
                    },
                    target: '.problem-display',
                    boxPosition: 'bottom'
                },
                {
                    icon: '🐸',
                    title: { 
                        en: 'Meet Freddy!', 
                        es: '¡Conoce a Freddy!' 
                    },
                    text: { 
                        en: 'This is Freddy the Frog! He starts at the beginning of the number line and is ready to jump!',
                        es: '¡Esta es Freddy la Rana! Comienza al inicio de la línea numérica y está lista para saltar!'
                    },
                    target: '.character',
                    boxPosition: 'top'
                },
                {
                    icon: '🔢',
                    title: { 
                        en: 'Clickable Numbers', 
                        es: 'Números Clicables' 
                    },
                    text: { 
                        en: 'See these glowing numbers? Click on the number where you think Freddy should land to solve the problem!',
                        es: '¿Ves estos números brillantes? ¡Haz clic en el número donde crees que Freddy debería aterrizar para resolver el problema!'
                    },
                    target: '.number-line',
                    boxPosition: 'bottom'
                },
                {
                    icon: '🤔',
                    title: { 
                        en: 'Think First!', 
                        es: '¡Piensa Primero!' 
                    },
                    text: { 
                        en: 'Look at the problem and think about the answer. You can also press number keys on your keyboard!',
                        es: '¡Mira el problema y piensa en la respuesta. También puedes presionar las teclas numéricas en tu teclado!'
                    },
                    target: '.instructions',
                    boxPosition: 'bottom'
                },
                {
                    icon: '🎯',
                    title: { 
                        en: 'Ready to Play!', 
                        es: '¡Listo para Jugar!' 
                    },
                    text: { 
                        en: 'Now you try! Click on the correct answer and watch Freddy jump there. If you get it wrong, don\'t worry - you\'ll get a helpful hint!',
                        es: '¡Ahora inténtalo! Haz clic en la respuesta correcta y observa a Freddy saltar allí. Si te equivocas, no te preocupes: ¡recibirás una pista útil!'
                    },
                    boxPosition: 'center'
                }
            ]
        };
    }
    
    getMathStackerTutorial() {
        return {
            gameType: 'math-stacker',
            steps: [
                {
                    icon: '👋',
                    title: { en: 'Welcome to Math Stacker!', es: '¡Bienvenido a Apilador de Matemáticas!' },
                    text: { 
                        en: 'Learn to add and subtract numbers vertically, just like in school! Let\'s see how it works.',
                        es: '¡Aprende a sumar y restar números verticalmente, como en la escuela! Veamos cómo funciona.'
                    },
                    boxPosition: 'center'
                },
                {
                    icon: '🔢',
                    title: { en: 'The Problem', es: 'El Problema' },
                    text: { 
                        en: 'Here are the two numbers stacked on top of each other. You\'ll add or subtract them!',
                        es: 'Aquí están los dos números apilados uno encima del otro. ¡Los sumarás o restarás!'
                    },
                    target: '.problem-stack',
                    boxPosition: 'bottom'
                },
                {
                    icon: '1️⃣',
                    title: { en: 'Start with Ones', es: 'Comienza con las Unidades' },
                    text: { 
                        en: 'First, add the ones column (the right side). Type your answer here!',
                        es: 'Primero, suma la columna de unidades (el lado derecho). ¡Escribe tu respuesta aquí!'
                    },
                    target: '.ones-input',
                    boxPosition: 'bottom'
                },
                {
                    icon: '🔟',
                    title: { en: 'Then the Tens', es: 'Luego las Decenas' },
                    text: { 
                        en: 'After the ones, add the tens column (the left side). Easy!',
                        es: 'Después de las unidades, suma la columna de decenas (el lado izquierdo). ¡Fácil!'
                    },
                    target: '.tens-input',
                    boxPosition: 'bottom'
                },
                {
                    icon: '🏗️',
                    title: { en: 'Build Your Tower!', es: '¡Construye tu Torre!' },
                    text: { 
                        en: 'Each correct answer adds a block to your tower. How tall can you build it?',
                        es: 'Cada respuesta correcta añade un bloque a tu torre. ¿Qué tan alta puedes construirla?'
                    },
                    target: '.tower',
                    boxPosition: 'left'
                },
                {
                    icon: '🎯',
                    title: { en: 'Ready to Stack!', es: '¡Listo para Apilar!' },
                    text: { 
                        en: 'Now you\'re ready! Start with the ones column and work your way up!',
                        es: '¡Ahora estás listo! Comienza con la columna de unidades y avanza!'
                    },
                    boxPosition: 'center'
                }
            ]
        };
    }
    
    getOperationPopTutorial() {
        return {
            gameType: 'operation-pop',
            steps: [
                {
                    icon: '🎈',
                    title: { en: 'Welcome to Operation Pop!', es: '¡Bienvenido a Estalla Operaciones!' },
                    text: { 
                        en: 'Pop balloons with math equations! But be careful - only pop the correct answers!',
                        es: '¡Revienta globos con ecuaciones matemáticas! Pero ten cuidado: ¡solo revienta las respuestas correctas!'
                    },
                    boxPosition: 'center'
                },
                {
                    icon: '🎯',
                    title: { en: 'Target Number', es: 'Número Objetivo' },
                    text: { 
                        en: 'This is your target number! Pop only the balloons that equal this number.',
                        es: '¡Este es tu número objetivo! Revienta solo los globos que sean iguales a este número.'
                    },
                    target: '.target-number',
                    boxPosition: 'bottom'
                },
                {
                    icon: '⏱️',
                    title: { en: 'Beat the Clock!', es: '¡Gana al Reloj!' },
                    text: { 
                        en: 'You have limited time! Pop as many correct balloons as you can before time runs out.',
                        es: '¡Tienes tiempo limitado! Revienta tantos globos correctos como puedas antes de que se acabe el tiempo.'
                    },
                    target: '.timer',
                    boxPosition: 'bottom'
                },
                {
                    icon: '✨',
                    title: { en: 'Start Popping!', es: '¡Comienza a Reventar!' },
                    text: { 
                        en: 'Click the Start Game button and pop those balloons! Remember - only pop equations that equal your target!',
                        es: '¡Haz clic en el botón Iniciar Juego y revienta esos globos! Recuerda: ¡solo revienta ecuaciones que sean iguales a tu objetivo!'
                    },
                    target: '#startBtn',
                    boxPosition: 'top'
                }
            ]
        };
    }
    
    getFactFamilyTutorial() {
        return {
            gameType: 'fact-family-farm',
            steps: [
                {
                    icon: '🐮',
                    title: { en: 'Welcome to Fact Family Farm!', es: '¡Bienvenido a Granja de Familias de Números!' },
                    text: { 
                        en: 'Help the farmer organize animals into groups that add up to the target number!',
                        es: '¡Ayuda al granjero a organizar animales en grupos que sumen el número objetivo!'
                    },
                    boxPosition: 'center'
                },
                {
                    icon: '🎯',
                    title: { en: 'Target Number', es: 'Número Objetivo' },
                    text: { 
                        en: 'This is the number you need to make! Find two animals that add up to this number.',
                        es: '¡Este es el número que necesitas hacer! Encuentra dos animales que sumen este número.'
                    },
                    target: '.target-number',
                    boxPosition: 'bottom'
                },
                {
                    icon: '🏡',
                    title: { en: 'The Barn', es: 'El Granero' },
                    text: { 
                        en: 'Drag animals here! When you have two that add up to your target, they\'ll pair up!',
                        es: '¡Arrastra animales aquí! Cuando tengas dos que sumen tu objetivo, ¡se emparejarán!'
                    },
                    target: '.barn',
                    boxPosition: 'bottom'
                },
                {
                    icon: '🌾',
                    title: { en: 'The Field', es: 'El Campo' },
                    text: { 
                        en: 'These are all the animals in the field. Drag them to the barn to make number pairs!',
                        es: 'Estos son todos los animales en el campo. ¡Arrástralos al granero para hacer pares de números!'
                    },
                    target: '.field',
                    boxPosition: 'top'
                },
                {
                    icon: '🎯',
                    title: { en: 'Start Farming!', es: '¡Comienza a Cultivar!' },
                    text: { 
                        en: 'Now try it! Drag animals to the barn and find pairs that add up to your target number!',
                        es: '¡Ahora inténtalo! ¡Arrastra animales al granero y encuentra pares que sumen tu número objetivo!'
                    },
                    boxPosition: 'center'
                }
            ]
        };
    }
    
    getPlaceValueTutorial() {
        return {
            gameType: 'place-value-puzzles',
            steps: [
                {
                    icon: '🧮',
                    title: { en: 'Welcome to Place Value Puzzles!', es: '¡Bienvenido a Rompecabezas de Valor Posicional!' },
                    text: { 
                        en: 'Build numbers using blocks! Learn about ones, tens, and hundreds.',
                        es: '¡Construye números usando bloques! Aprende sobre unidades, decenas y centenas.'
                    },
                    boxPosition: 'center'
                },
                {
                    icon: '🎯',
                    title: { en: 'Target Number', es: 'Número Objetivo' },
                    text: { 
                        en: 'This is the number you need to build! Use blocks to reach this number.',
                        es: '¡Este es el número que necesitas construir! Usa bloques para alcanzar este número.'
                    },
                    target: '.target-number',
                    boxPosition: 'bottom'
                },
                {
                    icon: '1️⃣',
                    title: { en: 'Ones Blocks', es: 'Bloques de Unidades' },
                    text: { 
                        en: 'Click here to add 1. Each ones block equals 1!',
                        es: '¡Haz clic aquí para añadir 1. Cada bloque de unidades vale 1!'
                    },
                    target: '#add1Btn',
                    boxPosition: 'right'
                },
                {
                    icon: '🔟',
                    title: { en: 'Tens Blocks', es: 'Bloques de Decenas' },
                    text: { 
                        en: 'Click here to add 10. Ten ones make one ten!',
                        es: '¡Haz clic aquí para añadir 10. Diez unidades hacen una decena!'
                    },
                    target: '#add10Btn',
                    boxPosition: 'right'
                },
                {
                    icon: '📊',
                    title: { en: 'Watch Your Total', es: 'Observa tu Total' },
                    text: { 
                        en: 'This shows your current number. Keep adding blocks until you reach your target!',
                        es: '¡Esto muestra tu número actual. Sigue añadiendo bloques hasta alcanzar tu objetivo!'
                    },
                    target: '.current-total',
                    boxPosition: 'bottom'
                },
                {
                    icon: '🎯',
                    title: { en: 'Start Building!', es: '¡Comienza a Construir!' },
                    text: { 
                        en: 'Now you try! Click the buttons to add blocks and reach your target number!',
                        es: '¡Ahora inténtalo! ¡Haz clic en los botones para añadir bloques y alcanzar tu número objetivo!'
                    },
                    boxPosition: 'center'
                }
            ]
        };
    }
    
    getStorekeeperTutorial() {
        return {
            gameType: 'storekeeper-stories',
            steps: [
                {
                    icon: '📖',
                    title: { en: 'Welcome to Storekeeper Stories!', es: '¡Bienvenido a Historias del Tendero!' },
                    text: { 
                        en: 'Read fun stories and solve real-world math problems! Every story has a math problem to solve.',
                        es: '¡Lee historias divertidas y resuelve problemas matemáticos del mundo real! Cada historia tiene un problema matemático para resolver.'
                    },
                    boxPosition: 'center'
                },
                {
                    icon: '📚',
                    title: { en: 'Read the Story', es: 'Lee la Historia' },
                    text: { 
                        en: 'Read this story carefully! It will tell you what math problem you need to solve.',
                        es: '¡Lee esta historia cuidadosamente! Te dirá qué problema matemático necesitas resolver.'
                    },
                    target: '.story-text',
                    boxPosition: 'bottom'
                },
                {
                    icon: '➕➖',
                    title: { en: 'Choose the Operation', es: 'Elige la Operación' },
                    text: { 
                        en: 'First, decide if you need to add (+) or subtract (-) to solve the problem.',
                        es: 'Primero, decide si necesitas sumar (+) o restar (-) para resolver el problema.'
                    },
                    target: '.operation-choices',
                    boxPosition: 'bottom'
                },
                {
                    icon: '✍️',
                    title: { en: 'Enter Your Answer', es: 'Ingresa tu Respuesta' },
                    text: { 
                        en: 'After choosing the operation, type your answer here and check if you\'re correct!',
                        es: 'Después de elegir la operación, escribe tu respuesta aquí y verifica si es correcta!'
                    },
                    target: '.answer-input',
                    boxPosition: 'top'
                },
                {
                    icon: '🎯',
                    title: { en: 'Start Reading!', es: '¡Comienza a Leer!' },
                    text: { 
                        en: 'Now you\'re ready! Read the story, choose the operation, and solve the problem!',
                        es: '¡Ahora estás listo! ¡Lee la historia, elige la operación y resuelve el problema!'
                    },
                    boxPosition: 'center'
                }
            ]
        };
    }
    
    getPatternTutorial() {
        return {
            gameType: 'pattern-painter',
            steps: [
                {
                    icon: '🎨',
                    title: { en: 'Welcome to Pattern Painter!', es: '¡Bienvenido a Pintor de Patrones!' },
                    text: { 
                        en: 'Find patterns with numbers, colors, and shapes! What comes next?',
                        es: '¡Encuentra patrones con números, colores y formas! ¿Qué sigue?'
                    },
                    boxPosition: 'center'
                },
                {
                    icon: '🔢',
                    title: { en: 'Choose Pattern Type', es: 'Elige Tipo de Patrón' },
                    text: { 
                        en: 'Pick what kind of pattern you want to solve: numbers, colors, or shapes!',
                        es: '¡Elige qué tipo de patrón quieres resolver: números, colores o formas!'
                    },
                    target: '.pattern-type-selector',
                    boxPosition: 'bottom'
                },
                {
                    icon: '👀',
                    title: { en: 'Study the Pattern', es: 'Estudia el Patrón' },
                    text: { 
                        en: 'Look carefully at the pattern. Can you see what\'s repeating or changing?',
                        es: 'Mira cuidadosamente el patrón. ¿Puedes ver qué se repite o cambia?'
                    },
                    target: '.pattern-sequence',
                    boxPosition: 'bottom'
                },
                {
                    icon: '❓',
                    title: { en: 'What Comes Next?', es: '¿Qué Sigue?' },
                    text: { 
                        en: 'This mystery box is what you need to figure out! What should go here?',
                        es: '¡Esta caja misteriosa es lo que necesitas descubrir! ¿Qué debería ir aquí?'
                    },
                    target: '.mystery-block',
                    boxPosition: 'top'
                },
                {
                    icon: '✅',
                    title: { en: 'Pick Your Answer', es: 'Elige tu Respuesta' },
                    text: { 
                        en: 'Click on one of these options to complete the pattern!',
                        es: '¡Haz clic en una de estas opciones para completar el patrón!'
                    },
                    target: '.answer-options',
                    boxPosition: 'top'
                },
                {
                    icon: '🎯',
                    title: { en: 'Start Painting!', es: '¡Comienza a Pintar!' },
                    text: { 
                        en: 'Now you try! Look for the pattern and choose what comes next!',
                        es: '¡Ahora inténtalo! ¡Busca el patrón y elige qué sigue!'
                    },
                    boxPosition: 'center'
                }
            ]
        };
    }
}

// Initialize tutorial system
const tutorialSystem = new TutorialSystem();
