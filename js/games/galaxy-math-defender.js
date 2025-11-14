// Galaxy Math Defender - Canvas space shooter for practicing arithmetic
class GalaxyMathDefender extends BaseGame {
    constructor(container) {
        super(container);
        // Note: super() calls createGameStructure() → setupGame() before this point
        // setupGame() will have already set this.canvas and this.ctx
        this.gameType = 'galaxy-math-defender';
        this.width = 800;
        this.height = 360;
        this.player = { x: 400, y: 320, lane: 2, targetX: 400, vx: 0 };
        this.lanes = 5;
        this.playerSpeed = 400; // pixels per second for sliding
        this.enemies = [];
        this.bullets = [];
        this.enemySpeed = 40; // pixels per second base
        this.bulletSpeed = 200;
        this.lastTime = null;
        this.animationId = null;
        this.currentProblem = null;
        this.nextProblem = null;
        this.lives = 3;
        this.wave = 1;
        this.keys = {};
        this.waveTransitioning = false;
        this.transitionDelay = 0;
        
        // Now that all properties exist, start the game (setupGame already set canvas/ctx)
        if (this.canvas && this.ctx) {
            this.startWave();
            this.updateHud();
            this.startLoop();
        }
    }

    getTitleKey() {
        return 'game-9-title';
    }

    setupGame() {
        const gameArea = document.getElementById('gameArea');
        gameArea.innerHTML = `
            <div class="gmd-container">
                <div class="gmd-hud">
                    <div class="gmd-question" id="gmdQuestion"><span data-i18n="gmd-shoot">Shoot</span>: ?</div>
                    <div class="gmd-score" id="gmdScore"><span data-i18n="score">Score</span>: 0</div>
                    <div class="gmd-lives" id="gmdLives"><span data-i18n="gmd-lives">Lives</span>: 3</div>
                </div>
                <div class="gmd-game-wrapper">
                    <div class="gmd-controls gmd-controls-left">
                        <button class="btn" id="gmdLeftBtn">◀</button>
                    </div>
                    <canvas id="gmdCanvas" width="800" height="360"></canvas>
                    <div class="gmd-controls gmd-controls-right">
                        <button class="btn" id="gmdRightBtn">▶</button>
                    </div>
                </div>
                <div class="gmd-controls gmd-controls-center">
                    <button class="btn" id="gmdFireBtn"><span data-i18n="gmd-fire">Fire</span> 🔫</button>
                </div>
            </div>
        `;

        this.canvas = document.getElementById('gmdCanvas');
        this.ctx = this.canvas.getContext('2d');

        this.setupEventListeners();
        
        // Don't start game here - properties don't exist yet
        // Constructor will start it after initializing properties

        if (typeof i18n !== 'undefined') {
            i18n.translatePage();
        }
    }

    setupEventListeners() {
        const leftBtn = document.getElementById('gmdLeftBtn');
        const rightBtn = document.getElementById('gmdRightBtn');
        const fireBtn = document.getElementById('gmdFireBtn');

        leftBtn.addEventListener('click', () => this.movePlayer(-1));
        rightBtn.addEventListener('click', () => this.movePlayer(1));
        fireBtn.addEventListener('click', () => this.fire());

        this._keydownHandler = (e) => {
            if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
            if (e.key === 'ArrowLeft') {
                this.keys.left = true;
            }
            if (e.key === 'ArrowRight') {
                this.keys.right = true;
            }
            if (e.key === ' ' || e.key === 'Spacebar') {
                e.preventDefault();
                this.fire();
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

    startWave() {
        this.currentProblem = this.generateProblemForDifficulty(this.difficulty || 'easy');
        this.spawnEnemiesForProblem(this.currentProblem);
    }

    generateProblemForDifficulty(diff) {
        let a, b, op, text, answer;
        if (diff === 'easy') {
            op = Math.random() < 0.5 ? '+' : '-';
            a = MathGames.randomBetween(0, 10);
            b = MathGames.randomBetween(0, 10);
            if (op === '-' && b > a) [a, b] = [b, a];
        } else if (diff === 'medium') {
            const r = Math.random();
            if (r < 0.33) op = '+';
            else if (r < 0.66) op = '-';
            else op = '*';
            a = MathGames.randomBetween(2, 20);
            b = MathGames.randomBetween(2, 10);
            if (op === '-' && b > a) [a, b] = [b, a];
        } else { // hard
            const r = Math.random();
            if (r < 0.4) op = '*';
            else op = '/';
            if (op === '*') {
                a = MathGames.randomBetween(3, 12);
                b = MathGames.randomBetween(3, 12);
            } else {
                b = MathGames.randomBetween(2, 12);
                const result = MathGames.randomBetween(2, 12);
                a = b * result;
            }
        }

        switch (op) {
            case '+': answer = a + b; text = `${a} + ${b}`; break;
            case '-': answer = a - b; text = `${a} - ${b}`; break;
            case '*': answer = a * b; text = `${a} × ${b}`; break;
            case '/': answer = a / b; text = `${a} ÷ ${b}`; break;
        }
        return { text, answer };
    }

    spawnEnemiesForProblem(problem) {
        // Don't clear enemies if already spawned - add new wave smoothly
        const baseY = -40;
        const laneWidth = this.width / this.lanes;
        const correctLane = MathGames.randomBetween(0, this.lanes - 1);

        // Correct enemy - don't make it obvious by position
        this.enemies.push({
            x: (correctLane + 0.5) * laneWidth,
            y: baseY - MathGames.randomBetween(0, 100),
            value: problem.answer,
            isCorrect: true
        });

        // Distractors - place in other lanes
        const usedValues = new Set([problem.answer]);
        const availableLanes = [];
        for (let i = 0; i < this.lanes; i++) {
            if (i !== correctLane) availableLanes.push(i);
        }
        
        // Shuffle available lanes
        for (let i = availableLanes.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [availableLanes[i], availableLanes[j]] = [availableLanes[j], availableLanes[i]];
        }

        const count = Math.min(3, availableLanes.length);
        for (let i = 0; i < count; i++) {
            let val;
            let attempts = 0;
            do {
                attempts++;
                const delta = MathGames.randomBetween(-8, 8) || 1;
                val = problem.answer + delta;
                if (val < 0) val = Math.abs(problem.answer + delta);
            } while (usedValues.has(val) && attempts < 20);
            usedValues.add(val);
            
            this.enemies.push({
                x: (availableLanes[i] + 0.5) * laneWidth,
                y: baseY - MathGames.randomBetween(0, 100),
                value: val,
                isCorrect: false
            });
        }
    }

    movePlayer(dir) {
        const laneWidth = this.width / this.lanes;
        const currentLane = Math.round(this.player.x / laneWidth - 0.5);
        let newLane = currentLane + dir;
        if (newLane < 0) newLane = 0;
        if (newLane > this.lanes - 1) newLane = this.lanes - 1;
        this.player.targetX = (newLane + 0.5) * laneWidth;
    }

    fire() {
        this.bullets.push({ x: this.player.x, y: this.player.y - 20 });
        MathGames.playSound('pop');
    }

    updateHud() {
        const q = document.getElementById('gmdQuestion');
        const s = document.getElementById('gmdScore');
        const l = document.getElementById('gmdLives');
        
        // Get translated labels
        const shootLabel = i18n && i18n.t ? i18n.t('gmd-shoot') : 'Shoot';
        const scoreLabel = i18n && i18n.t ? i18n.t('score') : 'Score';
        const livesLabel = i18n && i18n.t ? i18n.t('gmd-lives') : 'Lives';
        
        if (q && this.currentProblem) q.textContent = `${shootLabel}: ${this.currentProblem.text}`;
        if (s) s.textContent = `${scoreLabel}: ${this.score}`;
        if (l) l.textContent = `${livesLabel}: ${this.lives}`;
    }

    startLoop() {
        const step = (timestamp) => {
            if (!this.lastTime) this.lastTime = timestamp;
            const dt = (timestamp - this.lastTime) / 1000;
            this.lastTime = timestamp;
            this.update(dt);
            this.render();
            this.animationId = requestAnimationFrame(step);
        };
        this.animationId = requestAnimationFrame(step);
    }

    update(dt) {
        const laneWidth = this.width / this.lanes;

        // Handle wave transitioning delay
        if (this.waveTransitioning) {
            this.transitionDelay -= dt;
            if (this.transitionDelay <= 0) {
                this.waveTransitioning = false;
                if (this.nextProblem) {
                    this.currentProblem = this.nextProblem;
                    this.nextProblem = null;
                    this.spawnEnemiesForProblem(this.currentProblem);
                    this.updateHud();
                }
            }
        }

        // Smooth player movement with sliding
        if (this.keys.left) {
            this.player.targetX = Math.max(laneWidth * 0.5, this.player.targetX - this.playerSpeed * dt);
        }
        if (this.keys.right) {
            this.player.targetX = Math.min(this.width - laneWidth * 0.5, this.player.targetX + this.playerSpeed * dt);
        }
        
        // Interpolate player position towards target
        const dx = this.player.targetX - this.player.x;
        if (Math.abs(dx) > 1) {
            this.player.x += dx * 8 * dt; // Smooth interpolation
        } else {
            this.player.x = this.player.targetX;
        }

        // Move enemies
        const enemySpeed = this.enemySpeed + this.wave * 5;
        this.enemies.forEach(e => {
            e.y += enemySpeed * dt;
        });

        // Move bullets
        this.bullets.forEach(b => {
            b.y -= this.bulletSpeed * dt;
        });

        // Collision detection
        this.bullets.forEach(b => {
            this.enemies.forEach(e => {
                if (!e.dead && Math.abs(b.x - e.x) < laneWidth * 0.3 && Math.abs(b.y - e.y) < 25) {
                    e.dead = true;
                    b.hit = true;
                    if (e.isCorrect) {
                        this.handleCorrectHit();
                    } else {
                        this.handleWrongHit();
                    }
                }
            });
        });

        // Remove dead enemies, bullets that went off screen, and enemies that reached bottom
        this.enemies = this.enemies.filter(e => !e.dead && e.y < this.height + 50 && !e.deadMissed);
        this.bullets = this.bullets.filter(b => b.y > -20 && !b.hit);

        // Check enemies reaching bottom
        this.enemies.forEach(e => {
            if (!e.dead && e.y >= this.height - 40) {
                e.deadMissed = true;
                if (e.isCorrect) {
                    this.handleMissedCorrect();
                }
            }
        });
    }

    handleCorrectHit() {
        MathGames.playSound('correct');
        this.score += 10;
        this.recordCorrectAnswer?.();
        this.wave++;
        
        // Prepare next problem but don't spawn immediately
        this.nextProblem = this.generateProblemForDifficulty(this.difficulty || 'easy');
        this.waveTransitioning = true;
        this.transitionDelay = 1.5; // 1.5 second delay before next wave
        
        this.updateHud();
    }

    handleWrongHit() {
        MathGames.playSound('wrong');
        this.lives = Math.max(0, this.lives - 1);
        this.recordIncorrectAnswer?.();
        if (this.lives === 0) {
            this.gameOver();
        }
        this.updateHud();
    }

    handleMissedCorrect() {
        this.lives = Math.max(0, this.lives - 1);
        if (this.lives === 0) {
            this.gameOver();
        } else {
            this.wave++;
            this.startWave();
        }
        this.updateHud();
    }

    gameOver() {
        MathGames.playSound('wrong');
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        const q = document.getElementById('gmdQuestion');
        const gameOverLabel = i18n && i18n.t ? i18n.t('game-over') : 'Game Over';
        if (q) q.textContent = gameOverLabel;
    }

    render() {
        if (!this.ctx) return;
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.width, this.height);

        // Background
        const grd = ctx.createRadialGradient(this.width / 2, 0, 50, this.width / 2, this.height, this.height);
        grd.addColorStop(0, '#3949ab');
        grd.addColorStop(1, '#000');
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, this.width, this.height);

        // Stars
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        for (let i = 0; i < 30; i++) {
            const x = (i * 53) % this.width;
            const y = (i * 97) % this.height;
            ctx.fillRect(x, y, 2, 2);
        }

        // Draw target problem at top center with big, visible style
        if (this.currentProblem) {
            ctx.save();
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.strokeStyle = '#ffeb3b';
            ctx.lineWidth = 3;
            const boxWidth = 200;
            const boxHeight = 50;
            const boxX = this.width / 2 - boxWidth / 2;
            const boxY = 10;
            
            // Draw rounded rectangle background
            ctx.beginPath();
            ctx.roundRect(boxX, boxY, boxWidth, boxHeight, 8);
            ctx.fill();
            ctx.stroke();
            
            // Draw problem text
            ctx.fillStyle = '#000';
            ctx.font = 'bold 24px "Open Sans", sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(this.currentProblem.text + ' = ?', this.width / 2, boxY + boxHeight / 2);
            ctx.restore();
        }

        // Player ship
        ctx.save();
        ctx.translate(this.player.x, this.player.y);
        ctx.fillStyle = '#4caf50';
        ctx.beginPath();
        ctx.moveTo(0, -20);
        ctx.lineTo(16, 12);
        ctx.lineTo(-16, 12);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        // Enemies
        this.enemies.forEach(e => {
            ctx.save();
            ctx.translate(e.x, e.y);
            // All enemies same color - don't give away the answer!
            ctx.fillStyle = '#ff5722'; // Orange for all enemy ships
            ctx.beginPath();
            ctx.ellipse(0, 0, 26, 18, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 16px "Open Sans", sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(e.value, 0, 0);
            ctx.restore();
        });

        // Bullets
        ctx.fillStyle = '#ffeb3b';
        this.bullets.forEach(b => {
            ctx.fillRect(b.x - 2, b.y - 8, 4, 16);
        });
    }
}
