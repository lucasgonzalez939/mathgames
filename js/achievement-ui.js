// Achievement UI - Popups and Display
class AchievementUI {
    constructor() {
        this.queue = [];
        this.showing = false;
        this.createStarCounter();
    }
    
    // Create persistent star counter in navigation
    createStarCounter() {
        const navControls = document.querySelector('.nav-controls');
        if (!navControls) return;
        
        const starCounter = document.createElement('div');
        starCounter.className = 'star-counter';
        starCounter.id = 'starCounter';
        starCounter.innerHTML = `
            <span class="star-icon">⭐</span>
            <span class="star-count" id="starCount">${achievementSystem.stars}</span>
        `;
        starCounter.addEventListener('click', () => this.showAchievementsModal());
        starCounter.title = 'View your achievements';
        
        navControls.insertBefore(starCounter, navControls.firstChild);
    }
    
    // Update star counter
    updateStarCounter() {
        const starCount = document.getElementById('starCount');
        if (starCount) {
            const newCount = achievementSystem.stars;
            starCount.textContent = newCount;
            
            // Animate the counter
            starCount.parentElement.classList.add('star-pulse');
            setTimeout(() => {
                starCount.parentElement.classList.remove('star-pulse');
            }, 600);
        }
    }
    
    // Show achievement popup
    showAchievement(achievement) {
        this.queue.push(achievement);
        if (!this.showing) {
            this.showNext();
        }
    }
    
    showNext() {
        if (this.queue.length === 0) {
            this.showing = false;
            return;
        }
        
        this.showing = true;
        const achievement = this.queue.shift();
        
        // Create popup
        const popup = document.createElement('div');
        popup.className = 'achievement-popup';
        popup.innerHTML = `
            <div class="achievement-content">
                <div class="achievement-sparkle">✨</div>
                <div class="achievement-icon">${achievement.icon}</div>
                <div class="achievement-text">
                    <div class="achievement-title">${i18n.get('achievement-unlocked') || 'Achievement Unlocked!'}</div>
                    <div class="achievement-name">${achievement.name[i18n.currentLanguage]}</div>
                    <div class="achievement-description">${achievement.description[i18n.currentLanguage]}</div>
                    <div class="achievement-stars">
                        ${this.renderStars(achievement.stars)} <span class="stars-earned">+${achievement.stars}</span>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(popup);
        
        // Play sound
        MathGames.playSound('success');
        
        // Animate in
        setTimeout(() => popup.classList.add('show'), 10);
        
        // Update star counter
        this.updateStarCounter();
        
        // Auto-hide after 4 seconds
        setTimeout(() => {
            popup.classList.remove('show');
            setTimeout(() => {
                popup.remove();
                this.showNext();
            }, 300);
        }, 4000);
        
        // Click to dismiss
        popup.addEventListener('click', () => {
            popup.classList.remove('show');
            setTimeout(() => {
                popup.remove();
                this.showNext();
            }, 300);
        });
    }
    
    renderStars(count) {
        return '⭐'.repeat(count);
    }
    
    // Show achievements modal
    showAchievementsModal() {
        const modal = document.createElement('div');
        modal.className = 'achievement-modal';
        modal.id = 'achievementModal';
        
        const stats = achievementSystem.getStats();
        const unlockedAchievements = achievementSystem.getUnlockedAchievements();
        const unlockedBadges = achievementSystem.getUnlockedBadges();
        const nextBadge = achievementSystem.getNextBadgeProgress();
        const allAchievements = Object.values(achievementSystem.achievementDefinitions);
        
        modal.innerHTML = `
            <div class="achievement-modal-content">
                <div class="modal-header">
                    <h2>
                        <span class="modal-icon">🏆</span>
                        <span data-i18n="achievements">Achievements</span>
                    </h2>
                    <button class="modal-close" id="closeModal">✕</button>
                </div>
                
                <div class="modal-body">
                    <!-- Stats Summary -->
                    <div class="stats-summary">
                        <div class="stat-card">
                            <div class="stat-icon">⭐</div>
                            <div class="stat-value">${stats.stars}</div>
                            <div class="stat-label" data-i18n="total-stars">Total Stars</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon">📝</div>
                            <div class="stat-value">${stats.totalProblems}</div>
                            <div class="stat-label" data-i18n="problems-solved">Problems Solved</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon">🔥</div>
                            <div class="stat-value">${stats.bestStreak}</div>
                            <div class="stat-label" data-i18n="best-streak">Best Streak</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon">🎮</div>
                            <div class="stat-value">${stats.gamesPlayed}/7</div>
                            <div class="stat-label" data-i18n="games-played">Games Played</div>
                        </div>
                    </div>
                    
                    <!-- Next Badge Progress -->
                    ${nextBadge ? `
                        <div class="next-badge-section">
                            <h3 data-i18n="next-badge">Next Badge</h3>
                            <div class="badge-progress-card">
                                <div class="badge-icon" style="color: ${nextBadge.badge.color}">${nextBadge.badge.icon}</div>
                                <div class="badge-info">
                                    <div class="badge-name">${nextBadge.badge.name[i18n.currentLanguage]}</div>
                                    <div class="progress-bar">
                                        <div class="progress-fill" style="width: ${Math.min(nextBadge.progress, 100)}%"></div>
                                    </div>
                                    <div class="progress-text">${nextBadge.current} / ${nextBadge.needed} stars</div>
                                </div>
                            </div>
                        </div>
                    ` : '<div class="all-badges-unlocked">🎉 All badges unlocked! Amazing!</div>'}
                    
                    <!-- Badges -->
                    ${unlockedBadges.length > 0 ? `
                        <div class="badges-section">
                            <h3 data-i18n="your-badges">Your Badges</h3>
                            <div class="badges-grid">
                                ${unlockedBadges.map(badge => `
                                    <div class="badge-card unlocked">
                                        <div class="badge-icon" style="color: ${badge.color}">${badge.icon}</div>
                                        <div class="badge-name">${badge.name[i18n.currentLanguage]}</div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                    
                    <!-- Achievements -->
                    <div class="achievements-section">
                        <h3>
                            <span data-i18n="your-achievements">Your Achievements</span>
                            <span class="achievement-count">${unlockedAchievements.length}/${allAchievements.length}</span>
                        </h3>
                        <div class="achievements-grid">
                            ${allAchievements.map(achievement => {
                                const isUnlocked = achievementSystem.achievements[achievement.id];
                                return `
                                    <div class="achievement-card ${isUnlocked ? 'unlocked' : 'locked'}">
                                        <div class="achievement-card-icon">${isUnlocked ? achievement.icon : '🔒'}</div>
                                        <div class="achievement-card-info">
                                            <div class="achievement-card-name">${achievement.name[i18n.currentLanguage]}</div>
                                            <div class="achievement-card-desc">${achievement.description[i18n.currentLanguage]}</div>
                                            <div class="achievement-card-stars">${this.renderStars(achievement.stars)}</div>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Translate content
        if (typeof i18n !== 'undefined') {
            i18n.translatePage();
        }
        
        // Animate in
        setTimeout(() => modal.classList.add('show'), 10);
        
        // Close handlers
        const closeBtn = document.getElementById('closeModal');
        closeBtn.addEventListener('click', () => this.closeModal());
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal();
            }
        });
        
        // Keyboard support
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);
    }
    
    closeModal() {
        const modal = document.getElementById('achievementModal');
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => modal.remove(), 300);
        }
    }
    
    // Show celebration animation
    showCelebration(message = 'Amazing!') {
        const celebration = document.createElement('div');
        celebration.className = 'celebration-overlay';
        celebration.innerHTML = `
            <div class="celebration-content">
                <div class="celebration-emoji">🎉</div>
                <div class="celebration-message">${message}</div>
                <div class="confetti-container" id="confettiContainer"></div>
            </div>
        `;
        
        document.body.appendChild(celebration);
        
        // Create confetti
        this.createConfetti(document.getElementById('confettiContainer'));
        
        // Animate in
        setTimeout(() => celebration.classList.add('show'), 10);
        
        // Auto-hide
        setTimeout(() => {
            celebration.classList.remove('show');
            setTimeout(() => celebration.remove(), 500);
        }, 3000);
    }
    
    createConfetti(container) {
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE'];
        const shapes = ['square', 'circle', 'triangle'];
        
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.className = `confetti ${shapes[Math.floor(Math.random() * shapes.length)]}`;
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDelay = Math.random() * 0.5 + 's';
            confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
            container.appendChild(confetti);
        }
    }
}

// Initialize achievement UI
const achievementUI = new AchievementUI();

// Check for unseen achievements on page load
window.addEventListener('load', () => {
    const unseen = achievementSystem.getUnseenAchievements();
    unseen.forEach(achievement => {
        achievementUI.showAchievement(achievement);
    });
    achievementSystem.markAchievementsSeen();
});
