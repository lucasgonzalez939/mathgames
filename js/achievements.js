// Achievement and Reward System for Math Games
class AchievementSystem {
    constructor() {
        this.achievements = this.loadAchievements();
        this.stars = this.loadStars();
        this.badges = this.loadBadges();
        this.currentStreak = 0;
        this.bestStreak = this.loadBestStreak();
        this.totalProblemsCompleted = this.loadTotalProblems();
        
        this.achievementDefinitions = this.defineAchievements();
        this.badgeDefinitions = this.defineBadges();
    }
    
    defineAchievements() {
        return {
            // First time achievements
            'first-step': {
                id: 'first-step',
                name: { en: 'First Step!', es: '¡Primer Paso!' },
                description: { en: 'Complete your first problem', es: 'Completa tu primer problema' },
                icon: '👣',
                condition: (stats) => stats.totalProblems >= 1,
                stars: 1
            },
            'super-starter': {
                id: 'super-starter',
                name: { en: 'Super Starter', es: 'Súper Principiante' },
                description: { en: 'Complete 10 problems', es: 'Completa 10 problemas' },
                icon: '🌟',
                condition: (stats) => stats.totalProblems >= 10,
                stars: 2
            },
            'math-master': {
                id: 'math-master',
                name: { en: 'Math Master', es: 'Maestro de Matemáticas' },
                description: { en: 'Complete 50 problems', es: 'Completa 50 problemas' },
                icon: '👑',
                condition: (stats) => stats.totalProblems >= 50,
                stars: 5
            },
            
            // Streak achievements
            'on-fire': {
                id: 'on-fire',
                name: { en: 'On Fire!', es: '¡En Llamas!' },
                description: { en: 'Get 5 correct in a row', es: 'Acierta 5 seguidas' },
                icon: '🔥',
                condition: (stats) => stats.currentStreak >= 5,
                stars: 3
            },
            'unstoppable': {
                id: 'unstoppable',
                name: { en: 'Unstoppable!', es: '¡Imparable!' },
                description: { en: 'Get 10 correct in a row', es: 'Acierta 10 seguidas' },
                icon: '⚡',
                condition: (stats) => stats.currentStreak >= 10,
                stars: 5
            },
            
            // Game-specific achievements
            'frog-master': {
                id: 'frog-master',
                name: { en: 'Frog Master', es: 'Maestro Rana' },
                description: { en: 'Complete 10 Number Line problems', es: 'Completa 10 problemas de la Línea Numérica' },
                icon: '🐸',
                condition: (stats) => stats.gameStats && stats.gameStats['number-line-leap'] >= 10,
                stars: 2
            },
            'balloon-popper': {
                id: 'balloon-popper',
                name: { en: 'Balloon Popper', es: 'Reventador de Globos' },
                description: { en: 'Pop 50 balloons', es: 'Revienta 50 globos' },
                icon: '🎈',
                condition: (stats) => stats.gameStats && stats.gameStats['operation-pop'] >= 50,
                stars: 3
            },
            'tower-builder': {
                id: 'tower-builder',
                name: { en: 'Tower Builder', es: 'Constructor de Torres' },
                description: { en: 'Stack 15 problems', es: 'Apila 15 problemas' },
                icon: '🏗️',
                condition: (stats) => stats.gameStats && stats.gameStats['math-stacker'] >= 15,
                stars: 2
            },
            'farmer': {
                id: 'farmer',
                name: { en: 'Super Farmer', es: 'Súper Granjero' },
                description: { en: 'Complete 20 fact families', es: 'Completa 20 familias de números' },
                icon: '👨‍🌾',
                condition: (stats) => stats.gameStats && stats.gameStats['fact-family-farm'] >= 20,
                stars: 3
            },
            'builder': {
                id: 'builder',
                name: { en: 'Block Builder', es: 'Constructor de Bloques' },
                description: { en: 'Build 15 numbers', es: 'Construye 15 números' },
                icon: '🧱',
                condition: (stats) => stats.gameStats && stats.gameStats['place-value-puzzles'] >= 15,
                stars: 2
            },
            'shopkeeper': {
                id: 'shopkeeper',
                name: { en: 'Store Expert', es: 'Experto de Tienda' },
                description: { en: 'Solve 10 word problems', es: 'Resuelve 10 problemas de palabras' },
                icon: '🏪',
                condition: (stats) => stats.gameStats && stats.gameStats['storekeeper-stories'] >= 10,
                stars: 2
            },
            'pattern-pro': {
                id: 'pattern-pro',
                name: { en: 'Pattern Pro', es: 'Pro de Patrones' },
                description: { en: 'Find 20 patterns', es: 'Encuentra 20 patrones' },
                icon: '🎨',
                condition: (stats) => stats.gameStats && stats.gameStats['pattern-painter'] >= 20,
                stars: 3
            },
            
            // Speed achievements
            'quick-thinker': {
                id: 'quick-thinker',
                name: { en: 'Quick Thinker', es: 'Pensador Rápido' },
                description: { en: 'Solve 5 problems in under 10 seconds each', es: 'Resuelve 5 problemas en menos de 10 segundos cada uno' },
                icon: '💨',
                condition: (stats) => stats.fastSolves >= 5,
                stars: 3
            },
            
            // Completion achievements
            'game-explorer': {
                id: 'game-explorer',
                name: { en: 'Game Explorer', es: 'Explorador de Juegos' },
                description: { en: 'Try all 7 games', es: 'Prueba los 7 juegos' },
                icon: '🗺️',
                condition: (stats) => stats.gamesPlayed >= 7,
                stars: 4
            },
            'dedicated-learner': {
                id: 'dedicated-learner',
                name: { en: 'Dedicated Learner', es: 'Estudiante Dedicado' },
                description: { en: 'Complete 100 problems', es: 'Completa 100 problemas' },
                icon: '📚',
                condition: (stats) => stats.totalProblems >= 100,
                stars: 10
            }
        };
    }
    
    defineBadges() {
        return {
            'bronze-star': {
                id: 'bronze-star',
                name: { en: 'Bronze Star', es: 'Estrella de Bronce' },
                description: { en: 'Collect 10 stars', es: 'Colecciona 10 estrellas' },
                icon: '⭐',
                color: '#CD7F32',
                condition: (stars) => stars >= 10
            },
            'silver-star': {
                id: 'silver-star',
                name: { en: 'Silver Star', es: 'Estrella de Plata' },
                description: { en: 'Collect 25 stars', es: 'Colecciona 25 estrellas' },
                icon: '🌟',
                color: '#C0C0C0',
                condition: (stars) => stars >= 25
            },
            'gold-star': {
                id: 'gold-star',
                name: { en: 'Gold Star', es: 'Estrella de Oro' },
                description: { en: 'Collect 50 stars', es: 'Colecciona 50 estrellas' },
                icon: '✨',
                color: '#FFD700',
                condition: (stars) => stars >= 50
            },
            'diamond-star': {
                id: 'diamond-star',
                name: { en: 'Diamond Star', es: 'Estrella de Diamante' },
                description: { en: 'Collect 100 stars', es: 'Colecciona 100 estrellas' },
                icon: '💎',
                color: '#B9F2FF',
                condition: (stars) => stars >= 100
            }
        };
    }
    
    // Record a completed problem
    recordCompletion(gameType, wasCorrect, timeTaken = 0) {
        this.totalProblemsCompleted++;
        
        if (wasCorrect) {
            this.currentStreak++;
            if (this.currentStreak > this.bestStreak) {
                this.bestStreak = this.currentStreak;
                this.saveBestStreak();
            }
            
            // Check if it was a fast solve (under 10 seconds)
            if (timeTaken < 10000 && timeTaken > 0) {
                const fastSolves = this.loadFastSolves() || 0;
                this.saveFastSolves(fastSolves + 1);
            }
        } else {
            this.currentStreak = 0;
        }
        
        // Track game-specific stats
        this.updateGameStats(gameType);
        
        // Save progress
        this.saveTotalProblems();
        
        // Check for new achievements
        return this.checkAchievements(gameType);
    }
    
    updateGameStats(gameType) {
        const gameStats = this.loadGameStats();
        gameStats[gameType] = (gameStats[gameType] || 0) + 1;
        
        // Track games played
        const gamesPlayed = Object.keys(gameStats).length;
        localStorage.setItem('mathgames_games_played', gamesPlayed.toString());
        
        localStorage.setItem('mathgames_game_stats', JSON.stringify(gameStats));
    }
    
    checkAchievements(gameType) {
        const newAchievements = [];
        const stats = this.getStats();
        
        for (const [id, achievement] of Object.entries(this.achievementDefinitions)) {
            // Skip if already earned
            if (this.achievements[id]) continue;
            
            // Check condition
            if (achievement.condition(stats)) {
                this.unlockAchievement(id);
                newAchievements.push(achievement);
                this.addStars(achievement.stars);
            }
        }
        
        // Check badge progress
        this.checkBadges();
        
        return newAchievements;
    }
    
    checkBadges() {
        for (const [id, badge] of Object.entries(this.badgeDefinitions)) {
            if (!this.badges[id] && badge.condition(this.stars)) {
                this.unlockBadge(id);
            }
        }
    }
    
    unlockAchievement(achievementId) {
        this.achievements[achievementId] = {
            unlockedAt: Date.now(),
            seen: false
        };
        this.saveAchievements();
    }
    
    unlockBadge(badgeId) {
        this.badges[badgeId] = {
            unlockedAt: Date.now(),
            seen: false
        };
        this.saveBadges();
    }
    
    addStars(count) {
        this.stars += count;
        this.saveStars();
    }
    
    getStats() {
        return {
            totalProblems: this.totalProblemsCompleted,
            currentStreak: this.currentStreak,
            bestStreak: this.bestStreak,
            stars: this.stars,
            gameStats: this.loadGameStats(),
            gamesPlayed: parseInt(localStorage.getItem('mathgames_games_played') || '0'),
            fastSolves: this.loadFastSolves() || 0
        };
    }
    
    getUnseenAchievements() {
        const unseen = [];
        for (const [id, data] of Object.entries(this.achievements)) {
            if (!data.seen && this.achievementDefinitions[id]) {
                unseen.push({
                    ...this.achievementDefinitions[id],
                    unlockedAt: data.unlockedAt
                });
            }
        }
        return unseen;
    }
    
    markAchievementsSeen() {
        for (const id in this.achievements) {
            this.achievements[id].seen = true;
        }
        this.saveAchievements();
    }
    
    // Persistence methods
    loadAchievements() {
        const data = localStorage.getItem('mathgames_achievements');
        return data ? JSON.parse(data) : {};
    }
    
    saveAchievements() {
        localStorage.setItem('mathgames_achievements', JSON.stringify(this.achievements));
    }
    
    loadBadges() {
        const data = localStorage.getItem('mathgames_badges');
        return data ? JSON.parse(data) : {};
    }
    
    saveBadges() {
        localStorage.setItem('mathgames_badges', JSON.stringify(this.badges));
    }
    
    loadStars() {
        return parseInt(localStorage.getItem('mathgames_stars') || '0');
    }
    
    saveStars() {
        localStorage.setItem('mathgames_stars', this.stars.toString());
    }
    
    loadBestStreak() {
        return parseInt(localStorage.getItem('mathgames_best_streak') || '0');
    }
    
    saveBestStreak() {
        localStorage.setItem('mathgames_best_streak', this.bestStreak.toString());
    }
    
    loadTotalProblems() {
        return parseInt(localStorage.getItem('mathgames_total_problems') || '0');
    }
    
    saveTotalProblems() {
        localStorage.setItem('mathgames_total_problems', this.totalProblemsCompleted.toString());
    }
    
    loadGameStats() {
        const data = localStorage.getItem('mathgames_game_stats');
        return data ? JSON.parse(data) : {};
    }
    
    loadFastSolves() {
        return parseInt(localStorage.getItem('mathgames_fast_solves') || '0');
    }
    
    saveFastSolves(count) {
        localStorage.setItem('mathgames_fast_solves', count.toString());
    }
    
    // Get all unlocked achievements for display
    getUnlockedAchievements() {
        const unlocked = [];
        for (const [id, data] of Object.entries(this.achievements)) {
            if (this.achievementDefinitions[id]) {
                unlocked.push({
                    ...this.achievementDefinitions[id],
                    unlockedAt: data.unlockedAt
                });
            }
        }
        return unlocked.sort((a, b) => 
            this.achievements[b.id].unlockedAt - this.achievements[a.id].unlockedAt
        );
    }
    
    // Get all unlocked badges
    getUnlockedBadges() {
        const unlocked = [];
        for (const [id, data] of Object.entries(this.badges)) {
            if (this.badgeDefinitions[id]) {
                unlocked.push({
                    ...this.badgeDefinitions[id],
                    unlockedAt: data.unlockedAt
                });
            }
        }
        return unlocked;
    }
    
    // Get progress towards next badge
    getNextBadgeProgress() {
        const sortedBadges = Object.values(this.badgeDefinitions)
            .sort((a, b) => {
                // Extract star requirement from condition
                const aStars = this.getStarsNeeded(a);
                const bStars = this.getStarsNeeded(b);
                return aStars - bStars;
            });
        
        for (const badge of sortedBadges) {
            if (!this.badges[badge.id]) {
                const needed = this.getStarsNeeded(badge);
                return {
                    badge: badge,
                    current: this.stars,
                    needed: needed,
                    progress: (this.stars / needed) * 100
                };
            }
        }
        
        return null; // All badges unlocked!
    }
    
    getStarsNeeded(badge) {
        // Extract number from description
        const match = badge.description.en.match(/\d+/);
        return match ? parseInt(match[0]) : 999;
    }
    
    // Reset all progress (for testing or user request)
    resetProgress() {
        if (confirm('Are you sure you want to reset all progress? This cannot be undone!')) {
            localStorage.removeItem('mathgames_achievements');
            localStorage.removeItem('mathgames_badges');
            localStorage.removeItem('mathgames_stars');
            localStorage.removeItem('mathgames_best_streak');
            localStorage.removeItem('mathgames_total_problems');
            localStorage.removeItem('mathgames_game_stats');
            localStorage.removeItem('mathgames_games_played');
            localStorage.removeItem('mathgames_fast_solves');
            location.reload();
        }
    }
}

// Initialize global achievement system
const achievementSystem = new AchievementSystem();
