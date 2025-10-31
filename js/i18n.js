// Internationalization (i18n) System
class I18n {
    constructor() {
        this.currentLanguage = 'en';
        this.translations = {
            en: {
                // Navigation
                'main-title': 'Math Games - Fun Learning for Kids',
                'nav-title': 'Math Games',
                'nav-home': 'Home',
                'nav-restart': 'Restart',
                
                // Welcome page
                'welcome-title': 'Welcome to Math Games!',
                'welcome-subtitle': 'Choose a fun game to practice your math skills',
                
                // Grade levels
                'grade-1': '1st Grade',
                'grade-1-2': '1st & 2nd Grade',
                'grade-2-3': '2nd & 3rd Grade',
                'grade-1-2-3': '1st, 2nd & 3rd Grade',
                
                // Game titles and descriptions
                'game-1-title': 'Number Line Leap',
                'game-1-desc': 'Jump on the number line to solve addition!',
                'game-2-title': 'Math Stacker',
                'game-2-desc': 'Stack numbers vertically and practice carrying and borrowing!',
                'game-3-title': 'Operation Pop!',
                'game-3-desc': 'Pop balloons with the correct math answers!',
                'game-4-title': 'Fact Family Farm',
                'game-4-desc': 'Help animals find their number bond partners!',
                'game-5-title': 'Place Value Puzzles',
                'game-5-desc': 'Build numbers with hundreds, tens, and ones blocks!',
                'game-6-title': 'Storekeeper Stories',
                'game-6-desc': 'Solve real-world math word problems!',
                'game-7-title': 'Pattern Painter',
                'game-7-desc': 'Complete patterns and practice skip-counting!',
                
                // Common game elements
                'score': 'Score',
                'level': 'Level',
                'difficulty-easy': 'Easy',
                'difficulty-medium': 'Medium',
                'difficulty-hard': 'Hard',
                'correct': 'Correct!',
                'try-again': 'Try Again!',
                'well-done': 'Well Done!',
                'next-level': 'Next Level',
                'play-again': 'Play Again',
                'jump-by': 'Jump by',
                'equals': 'equals',
                
                // Number Line Leap
                'numberline-instructions': 'Help the frog jump to solve the problem!',
                'numberline-complete': 'Great jumping! You solved it!',
                
                // Math Stacker
                'mathstacker-instructions': 'Solve the addition step by step. Remember to carry when needed!',
                'mathstacker-ones': 'Ones',
                'mathstacker-tens': 'Tens',
                'mathstacker-carry': 'Carry',
                'mathstacker-help-title': 'How to play Math Stacker',
                'mathstacker-help-ones': 'Start with the ones (right box). Type the last digit of the sum.',
                'mathstacker-help-carry': 'If the ones add to 10 or more, click the carry box to add 1 to the tens.',
                'mathstacker-help-tens': 'Then type the tens (left box). Press Enter or Check.',
                
                // Operation Pop
                'operationpop-instructions': 'Pop all balloons that equal',
                'operationpop-timeup': 'Time\'s up!',
                'operationpop-score': 'Balloons popped',
                
                // Fact Family Farm
                'factfarm-instructions': 'Drag animals to the barn to make',
                'factfarm-barn': 'Barn',
                'factfarm-field': 'Field',
                
                // Place Value Puzzles
                'placevalue-instructions': 'Build the number',
                'placevalue-add100': 'Add 100',
                'placevalue-add10': 'Add 10',
                'placevalue-add1': 'Add 1',
                'placevalue-reset': 'Reset',
                'placevalue-total': 'Total',
                
                // Storekeeper Stories
                'storekeeper-instructions': 'Read the story and solve the math problem!',
                'storekeeper-choose-operation': 'Choose the operation',
                'storekeeper-enter-answer': 'Enter your answer',
                
                // Pattern Painter
                'pattern-instructions': 'What comes next in the pattern?',
                'pattern-continue': 'Great! Continue the pattern!',
                
                // Additional common elements
                'backwards': 'backwards',
                'total': 'Total',
                'problem': 'Problem',
                'time': 'Time',
                'addition': 'Addition',
                'subtraction': 'Subtraction',
                'numbers': 'Numbers',
                'colors': 'Colors',
                'shapes': 'Shapes',
                'streak': 'Streak',
                
                // Achievement System
                'achievement-unlocked': 'Achievement Unlocked!',
                'achievements': 'Achievements',
                'total-stars': 'Total Stars',
                'problems-solved': 'Problems Solved',
                'best-streak': 'Best Streak',
                'games-played': 'Games Played',
                'next-badge': 'Next Badge',
                'your-badges': 'Your Badges',
                'your-achievements': 'Your Achievements',
                
                // Tutorial System
                'step': 'Step',
                'skip-tutorial': 'Skip Tutorial',
                'back': 'Back',
                'next': 'Next',
                'got-it': 'Got it!',
                'confirm-skip-tutorial': 'Are you sure you want to skip this tutorial?',
                'tutorial-complete': 'Tutorial Complete! 🎉',
                'show-tutorial': 'Show Tutorial',
                'hundreds': 'Hundreds',
                'tens': 'Tens',
                'ones': 'Ones',
                'pairs-found': 'Pairs found',
                
                // Error messages
                'error-load': 'Error loading game. Please try again.',
                'error-network': 'Network error. Please check your connection.'
            },
            es: {
                // Navigation
                'main-title': 'Juegos de Matemáticas - Aprendizaje Divertido para Niños',
                'nav-title': 'Juegos de Matemáticas',
                'nav-home': 'Inicio',
                'nav-restart': 'Reiniciar',
                
                // Welcome page
                'welcome-title': '¡Bienvenido a Juegos de Matemáticas!',
                'welcome-subtitle': 'Elige un juego divertido para practicar tus habilidades matemáticas',
                
                // Grade levels
                'grade-1': '1er Grado',
                'grade-1-2': '1er y 2do Grado',
                'grade-2-3': '2do y 3er Grado',
                'grade-1-2-3': '1er, 2do y 3er Grado',
                
                // Game titles and descriptions
                'game-1-title': 'Salto en la Recta Numérica',
                'game-1-desc': '¡Salta en la recta numérica para resolver sumas!',
                'game-2-title': 'Apilador de Matemáticas',
                'game-2-desc': '¡Apila números verticalmente y practica llevar y pedir prestado!',
                'game-3-title': '¡Estalla Operaciones!',
                'game-3-desc': '¡Revienta globos con las respuestas matemáticas correctas!',
                'game-4-title': 'Granja de Familias de Números',
                'game-4-desc': '¡Ayuda a los animales a encontrar sus compañeros de enlace numérico!',
                'game-5-title': 'Rompecabezas de Valor Posicional',
                'game-5-desc': '¡Construye números con bloques de centenas, decenas y unidades!',
                'game-6-title': 'Historias del Tendero',
                'game-6-desc': '¡Resuelve problemas matemáticos del mundo real!',
                'game-7-title': 'Pintor de Patrones',
                'game-7-desc': '¡Completa patrones y practica contar de dos en dos!',
                
                // Common game elements
                'score': 'Puntuación',
                'level': 'Nivel',
                'difficulty-easy': 'Fácil',
                'difficulty-medium': 'Medio',
                'difficulty-hard': 'Difícil',
                'correct': '¡Correcto!',
                'try-again': '¡Inténtalo de nuevo!',
                'well-done': '¡Bien hecho!',
                'next-level': 'Siguiente Nivel',
                'play-again': 'Jugar de Nuevo',
                'jump-by': 'Saltar por',
                'equals': 'igual a',
                
                // Number Line Leap
                'numberline-instructions': '¡Ayuda a la rana a saltar para resolver el problema!',
                'numberline-complete': '¡Excelente salto! ¡Lo resolviste!',
                
                // Math Stacker
                'mathstacker-instructions': 'Resuelve la suma paso a paso. ¡Recuerda llevar cuando sea necesario!',
                'mathstacker-ones': 'Unidades',
                'mathstacker-tens': 'Decenas',
                'mathstacker-carry': 'Llevar',
                'mathstacker-help-title': 'Cómo jugar Apilador de Matemáticas',
                'mathstacker-help-ones': 'Comienza con las unidades (caja derecha). Escribe el último dígito de la suma.',
                'mathstacker-help-carry': 'Si las unidades suman 10 o más, haz clic en la caja de llevar para añadir 1 a las decenas.',
                'mathstacker-help-tens': 'Luego escribe las decenas (caja izquierda). Presiona Enter o Verificar.',
                
                // Operation Pop
                'operationpop-instructions': 'Revienta todos los globos que sean igual a',
                'operationpop-timeup': '¡Se acabó el tiempo!',
                'operationpop-score': 'Globos reventados',
                
                // Fact Family Farm
                'factfarm-instructions': 'Arrastra animales al granero para hacer',
                'factfarm-barn': 'Granero',
                'factfarm-field': 'Campo',
                
                // Place Value Puzzles
                'placevalue-instructions': 'Construye el número',
                'placevalue-add100': 'Añadir 100',
                'placevalue-add10': 'Añadir 10',
                'placevalue-add1': 'Añadir 1',
                'placevalue-reset': 'Reiniciar',
                'placevalue-total': 'Total',
                
                // Storekeeper Stories
                'storekeeper-instructions': '¡Lee la historia y resuelve el problema matemático!',
                'storekeeper-choose-operation': 'Elige la operación',
                'storekeeper-enter-answer': 'Ingresa tu respuesta',
                
                // Pattern Painter
                'pattern-instructions': '¿Qué sigue en el patrón?',
                'pattern-continue': '¡Genial! ¡Continúa el patrón!',
                
                // Additional common elements
                'backwards': 'hacia atrás',
                'total': 'Total',
                'problem': 'Problema',
                'time': 'Tiempo',
                'addition': 'Suma',
                'subtraction': 'Resta',
                'numbers': 'Números',
                'colors': 'Colores',
                'shapes': 'Formas',
                'streak': 'Racha',
                'hundreds': 'Centenas',
                'tens': 'Decenas',
                'ones': 'Unidades',
                'pairs-found': 'Pares encontrados',
                
                // Achievement System
                'achievement-unlocked': '¡Logro Desbloqueado!',
                'achievements': 'Logros',
                'total-stars': 'Estrellas Totales',
                'problems-solved': 'Problemas Resueltos',
                'best-streak': 'Mejor Racha',
                'games-played': 'Juegos Jugados',
                'next-badge': 'Próxima Insignia',
                'your-badges': 'Tus Insignias',
                'your-achievements': 'Tus Logros',
                
                // Tutorial System
                'step': 'Paso',
                'skip-tutorial': 'Saltar Tutorial',
                'back': 'Atrás',
                'next': 'Siguiente',
                'got-it': '¡Entendido!',
                'confirm-skip-tutorial': '¿Estás seguro de que quieres saltar este tutorial?',
                'tutorial-complete': '¡Tutorial Completado! 🎉',
                'show-tutorial': 'Mostrar Tutorial',
                
                // Error messages
                'error-load': 'Error al cargar el juego. Por favor, inténtalo de nuevo.',
                'error-network': 'Error de red. Por favor, verifica tu conexión.'
            }
        };
        
        this.init();
    }
    
    init() {
        // Get saved language or default to English
        this.currentLanguage = localStorage.getItem('mathgames-language') || 'en';
        this.updateLanguage(this.currentLanguage);
        
        const boot = () => {
            this.setupLanguageToggle();
            this.translatePage();
        };
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', boot);
        } else {
            boot();
        }
    }
    
    setupLanguageToggle() {
        const langButtons = document.querySelectorAll('.lang-btn');
        langButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const newLang = btn.getAttribute('data-lang');
                this.changeLanguage(newLang);
            });
        });
    }
    
    changeLanguage(lang) {
        if (this.translations[lang]) {
            this.currentLanguage = lang;
            localStorage.setItem('mathgames-language', lang);
            this.updateLanguage(lang);
            this.translatePage();
        }
    }
    
    updateLanguage(lang) {
        // Update active language button
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-lang') === lang) {
                btn.classList.add('active');
            }
        });
        
        // Update HTML lang attribute
        document.documentElement.lang = lang;
    }
    
    translatePage() {
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.get(key);
            if (translation) {
                // Check if the element has a title attribute for accessibility
                if (element.hasAttribute('title')) {
                    element.title = translation;
                }
                // Update text content
                element.textContent = translation;
            }
        });
    }
    
    get(key) {
        const translation = this.translations[this.currentLanguage]?.[key];
        if (!translation) {
            console.warn(`Translation not found for key: ${key} in language: ${this.currentLanguage}`);
            return this.translations['en']?.[key] || key;
        }
        return translation;
    }
    
    getCurrentLanguage() {
        return this.currentLanguage;
    }
}

// Initialize i18n system
const i18n = new I18n();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = I18n;
}