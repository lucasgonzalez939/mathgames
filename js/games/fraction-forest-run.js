// Fraction Forest Run - Canvas platformer for practicing fractions and arithmetic
class FractionForestRun extends BaseGame {
    constructor(container) {
        super(container);
        // Note: super() calls createGameStructure() → setupGame() before this point
        // setupGame() will have already set this.canvas and this.ctx
        this.gameType = 'fraction-forest-run';
        this.width = 800;
        this.height = 360;
        this.player = { 
            x: 0, 
            y: 0, 
            vx: 0,
            vy: 0,
            width: 30,
            height: 40,
            onGround: false,
            grounded: false
        };
        this.platforms = []; // {x, y, width, height, value, isTarget, collected}
        this.gravity = 800; // pixels per second squared
        this.jumpStrength = -400; // pixels per second
        this.moveSpeed = 200; // pixels per second
        this.currentTotal = 0;
        this.targetValue = 0;
        this.sectionIndex = 0;
        this.maxSections = 10;
        this.animationId = null;
        this.keys = {};
        this.lastTime = 0;
        
        // Now that all properties exist, start the game (setupGame already set canvas/ctx)
        if (this.canvas && this.ctx) {
            this.startNewSection();
            this.updateHud();
            this.startLoop();
        }
    }

    getTitleKey() {
        return 'game-8-title';
    }

    setupGame() {
        const gameArea = document.getElementById('gameArea');
        gameArea.innerHTML = `
            <div class="ffr-container">
                <div class="ffr-hud">
                    <div class="ffr-target" id="ffrTarget">Target: 0</div>
                    <div class="ffr-current" id="ffrCurrent">Current: 0</div>
                    <div class="ffr-score" id="ffrScore">Score: 0</div>
                </div>
                <div class="ffr-game-wrapper">
                    <div class="ffr-controls ffr-controls-left">
                        <button class="btn" id="ffrLeftBtn">◀</button>
                    </div>
                    <canvas id="ffrCanvas" width="800" height="360"></canvas>
                    <div class="ffr-controls ffr-controls-right">
                        <button class="btn" id="ffrRightBtn">▶</button>
                    </div>
                </div>
                <div class="ffr-controls ffr-controls-center">
                    <button class="btn" id="ffrUpBtn">Jump ⬆</button>
                </div>
            </div>
        `;

        this.canvas = document.getElementById('ffrCanvas');
        this.ctx = this.canvas.getContext('2d');

        this.setupEventListeners();
        
        // Don't start game here - properties don't exist yet
        // Constructor will start it after initializing properties

        if (typeof i18n !== 'undefined') {
            i18n.translatePage();
        }
    }

    setupEventListeners() {
        const leftBtn = document.getElementById('ffrLeftBtn');
        const rightBtn = document.getElementById('ffrRightBtn');
        const upBtn = document.getElementById('ffrUpBtn');
        const downBtn = document.getElementById('ffrDownBtn');

        leftBtn.addEventListener('click', () => { this.keys.left = true; setTimeout(() => this.keys.left = false, 100); });
        rightBtn.addEventListener('click', () => { this.keys.right = true; setTimeout(() => this.keys.right = false, 100); });
        upBtn.addEventListener('click', () => this.jump());
        // Down button not needed for platformer, but keep for UI consistency

        this._keydownHandler = (e) => {
            if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
            if (e.key === 'ArrowLeft') this.keys.left = true;
            if (e.key === 'ArrowRight') this.keys.right = true;
            if (e.key === 'ArrowUp' || e.key === ' ') {
                e.preventDefault();
                this.jump();
            }
        };
        
        this._keyupHandler = (e) => {
            if (e.key === 'ArrowLeft') this.keys.left = false;
            if (e.key === 'ArrowRight') this.keys.right = false;
        };
        
        document.addEventListener('keydown', this._keydownHandler);
        document.addEventListener('keyup', this._keyupHandler);
    }

    restart() {
        if (this._keydownHandler) {
            document.removeEventListener('keydown', this._keydownHandler);
            this._keydownHandler = null;
        }
        if (this._keyupHandler) {
            document.removeEventListener('keyup', this._keyupHandler);
            this._keyupHandler = null;
        }
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        super.restart();
    }

    startNewSection() {
        this.sectionIndex++;
        this.currentTotal = 0;
        this.generateSection();
        this.placePlayer();
        this.updateHud();
    }

    generateSection() {
        this.platforms = [];
        const difficulty = this.difficulty || 'easy';
        let target;
        if (difficulty === 'easy') {
            target = MathGames.randomBetween(5, 15);
        } else if (difficulty === 'medium') {
            target = MathGames.randomBetween(10, 30);
        } else {
            target = MathGames.randomBetween(20, 50);
        }
        this.targetValue = target;

        // Difficulty increases with section number - more platforms as you progress
        const basePlatforms = 3;
        const extraPlatforms = Math.min(3, Math.floor(this.sectionIndex / 3)); // +1 platform every 3 sections
        const totalPlatforms = basePlatforms + extraPlatforms;
        
        // Generate platforms with values (some are distractors)
        const steps = MathGames.randomBetween(totalPlatforms, totalPlatforms + 2);
        let remaining = target;
        const platformValues = [];
        
        // First, create the correct path that sums to target
        const correctSteps = MathGames.randomBetween(3, 4);
        for (let i = 0; i < correctSteps - 1; i++) {
            const maxStep = Math.max(1, Math.floor(remaining / (correctSteps - i)));
            const value = MathGames.randomBetween(1, maxStep);
            remaining -= value;
            platformValues.push({ value, isCorrectPath: true });
        }
        platformValues.push({ value: remaining, isCorrectPath: true });
        
        // Add distractor platforms with random values
        const distractors = steps - correctSteps;
        for (let i = 0; i < distractors; i++) {
            const distractorValue = MathGames.randomBetween(1, Math.floor(target / 2));
            platformValues.push({ value: distractorValue, isCorrectPath: false });
        }
        
        // Shuffle platforms so correct path isn't obvious
        for (let i = platformValues.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [platformValues[i], platformValues[j]] = [platformValues[j], platformValues[i]];
        }
        
        // Calculate max jump height: v² = 2gh, where v = jumpStrength
        const maxJumpHeight = (this.jumpStrength * this.jumpStrength) / (2 * this.gravity);
        const safeJumpHeight = maxJumpHeight * 0.8;
        
        // Create platforms with proper spacing and reachable heights
        const startX = 180; // Leave room for ground platform
        const endX = this.width - 100;
        const availableWidth = endX - startX;
        const spacingX = availableWidth / (steps + 1);
        const groundY = this.height - 60;
        
        for (let i = 0; i < platformValues.length; i++) {
            const x = startX + (i + 1) * spacingX;
            // Vary height but keep within jump range
            const heightVariation = Math.random() * safeJumpHeight * 0.6;
            const y = groundY - heightVariation;
            const width = 70;
            const height = 15;
            
            this.platforms.push({
                x,
                y,
                width,
                height,
                value: platformValues[i].value,
                isTarget: false,
                collected: false
            });
        }
        
        // Add ground platform at start (returns player to base)
        this.platforms.push({
            x: 0,
            y: groundY,
            width: 160,
            height: 20,
            value: 0,
            isTarget: false,
            collected: true // Don't collect ground
        });
        
        // Add target platform on ground at the end
        this.platforms.push({
            x: endX,
            y: groundY,
            width: 100,
            height: 20,
            value: 0,
            isTarget: true,
            collected: true // Don't collect, just check total
        });
    }

    placePlayer() {
        this.player.x = 80; // Start on ground platform
        this.player.y = this.height - 100;
        this.player.vx = 0;
        this.player.vy = 0;
        this.player.onGround = false;
    }

    jump() {
        if (this.player.onGround) {
            this.player.vy = this.jumpStrength;
            this.player.onGround = false;
            MathGames.playSound('pop');
        }
    }

    update(dt) {
        // Apply gravity
        this.player.vy += this.gravity * dt;
        
        // Horizontal movement
        if (this.keys.left) {
            this.player.vx = -this.moveSpeed;
        } else if (this.keys.right) {
            this.player.vx = this.moveSpeed;
        } else {
            this.player.vx = 0;
        }
        
        // Update position
        this.player.x += this.player.vx * dt;
        this.player.y += this.player.vy * dt;
        
        // Keep player in bounds horizontally
        if (this.player.x < this.player.width / 2) {
            this.player.x = this.player.width / 2;
        }
        if (this.player.x > this.width - this.player.width / 2) {
            this.player.x = this.width - this.player.width / 2;
        }
        
        // Ground collision (bottom of screen)
        if (this.player.y + this.player.height / 2 > this.height) {
            this.player.y = this.height - this.player.height / 2;
            this.player.vy = 0;
            this.player.onGround = true;
        }
        
        // Platform collision
        this.player.onGround = false;
        for (let plat of this.platforms) {
            if (this.checkPlatformCollision(plat)) {
                // Land on platform
                this.player.y = plat.y - this.player.height / 2;
                this.player.vy = 0;
                this.player.onGround = true;
                
                // Collect platform value
                if (!plat.collected && plat.value > 0) {
                    plat.collected = true;
                    this.currentTotal += plat.value;
                    this.updateHud();
                    MathGames.playSound('pop');
                }
                
                // Check if this is the target platform
                if (plat.isTarget) {
                    if (this.currentTotal === this.targetValue) {
                        this.onCorrectSection();
                    } else {
                        this.onWrongSection();
                    }
                }
                break;
            }
        }
    }

    checkPlatformCollision(plat) {
        // Check if player is falling onto platform from above
        if (this.player.vy < 0) return false; // Moving up, no collision
        
        const playerLeft = this.player.x - this.player.width / 2;
        const playerRight = this.player.x + this.player.width / 2;
        const playerBottom = this.player.y + this.player.height / 2;
        const playerTop = this.player.y - this.player.height / 2;
        
        const platLeft = plat.x;
        const platRight = plat.x + plat.width;
        const platTop = plat.y;
        const platBottom = plat.y + plat.height;
        
        // Check horizontal overlap
        if (playerRight < platLeft || playerLeft > platRight) return false;
        
        // Check if player is landing on platform (within a small threshold)
        if (playerBottom >= platTop && playerTop < platTop && this.player.vy >= 0) {
            return true;
        }
        
        return false;
    }

    onCorrectSection() {
        MathGames.playSound('correct');
        this.updateScore(20);
        this.recordCorrectAnswer?.();
        if (this.sectionIndex % 3 === 0) {
            this.updateLevel();
        }
        this.startNewSection();
    }

    onWrongSection() {
        MathGames.playSound('wrong');
        this.recordIncorrectAnswer?.();
        // Reset this section - player must try again
        this.currentTotal = 0;
        
        // Reset all collected platforms
        this.platforms.forEach(p => {
            if (p.value > 0) {
                p.collected = false;
            }
        });
        
        // Move player back to start
        this.placePlayer();
        this.updateHud();
    }

    updateHud() {
        const targetEl = document.getElementById('ffrTarget');
        const currentEl = document.getElementById('ffrCurrent');
        const scoreEl = document.getElementById('ffrScore');
        if (targetEl) targetEl.textContent = `Target: ${this.targetValue}`;
        if (currentEl) {
            const color = this.currentTotal > this.targetValue ? '#f44336' : '#4caf50';
            currentEl.innerHTML = `Current: <span style="color: ${color}">${this.currentTotal}</span>`;
        }
        if (scoreEl) scoreEl.textContent = `Score: ${this.score}`;
    }

    startLoop() {
        this.lastTime = performance.now();
        const loop = (currentTime) => {
            const dt = Math.min((currentTime - this.lastTime) / 1000, 0.1); // Cap at 100ms
            this.lastTime = currentTime;
            
            this.update(dt);
            this.render();
            this.animationId = requestAnimationFrame(loop);
        };
        this.animationId = requestAnimationFrame(loop);
    }

    render() {
        if (!this.ctx) return;
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.width, this.height);

        // Background layers
        const grd = ctx.createLinearGradient(0, 0, 0, this.height);
        grd.addColorStop(0, '#a8e6ff');
        grd.addColorStop(1, '#f5ffe8');
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, this.width, this.height);

        // Draw ground
        ctx.fillStyle = '#5b8a3c';
        ctx.fillRect(0, this.height - this.cellHeight, this.width, this.cellHeight);

        // Draw platforms
        this.platforms.forEach(p => {
            const alpha = p.collected ? 0.3 : 1.0;
            ctx.globalAlpha = alpha;
            
            ctx.fillStyle = p.isTarget ? '#4caf50' : '#8b5a2b';
            ctx.beginPath();
            ctx.roundRect(p.x, p.y, p.width, p.height, 8);
            ctx.fill();

            if (p.value > 0) {
                ctx.fillStyle = '#fff';
                ctx.font = '16px "Open Sans", sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(p.value, p.x + p.width / 2, p.y + p.height / 2);
            }
            
            ctx.globalAlpha = 1.0;
        });

        // Draw player as a simple character
        const px = this.player.x;
        const py = this.player.y;
        ctx.save();
        ctx.translate(px, py);
        // body
        ctx.fillStyle = '#ffb74d';
        ctx.beginPath();
        ctx.arc(0, -10, 14, 0, Math.PI * 2);
        ctx.fill();
        // eyes
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(-5, -12, 2, 0, Math.PI * 2);
        ctx.arc(5, -12, 2, 0, Math.PI * 2);
        ctx.fill();
        // body rectangle
        ctx.fillStyle = '#42a5f5';
        ctx.fillRect(-10, -2, 20, 18);
        ctx.restore();
    }
}
