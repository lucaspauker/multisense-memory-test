class MemoryTest {
    constructor() {
        this.wordPairs = [];
        this.studyPairs = [];
        this.recallPairs = [];
        this.currentStudyIndex = 0;
        this.currentRecallIndex = 0;
        this.userAnswers = [];
        this.settings = {
            condition: 'visual',
            wordCount: 20,
            timePerPair: 3
        };
        
        this.init();
    }

    init() {
        this.loadWordPairs();
        this.setupEventListeners();
        this.updateTimeDisplay();
    }

    async loadWordPairs() {
        try {
            const response = await fetch('./swahili_nouns_200.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.wordPairs = await response.json();
            console.log(`Loaded ${this.wordPairs.length} word pairs successfully`);
        } catch (error) {
            console.error('Error loading word pairs:', error);
            alert('Error loading word data. Please run a local server to avoid CORS restrictions.\n\nQuick fix: Run "python3 -m http.server 8000" in this directory, then open http://localhost:8000');
            throw error;
        }
    }

    setupEventListeners() {
        // Time slider
        document.getElementById('time-per-pair').addEventListener('input', (e) => {
            this.settings.timePerPair = parseInt(e.target.value);
            this.updateTimeDisplay();
        });

        // Start button
        document.getElementById('start-btn').addEventListener('click', () => {
            this.startTest();
        });

        // Submit button
        document.getElementById('submit-btn').addEventListener('click', () => {
            this.submitAnswer();
        });

        // Skip button
        document.getElementById('skip-btn').addEventListener('click', () => {
            this.skipAnswer();
        });

        // Enter key in recall input
        document.getElementById('recall-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.submitAnswer();
            }
        });

        // Restart button
        document.getElementById('restart-btn').addEventListener('click', () => {
            this.restart();
        });
    }

    updateTimeDisplay() {
        document.getElementById('time-display').textContent = this.settings.timePerPair;
    }

    startTest() {
        // Get settings
        this.settings.condition = document.querySelector('input[name="condition"]:checked').value;
        this.settings.wordCount = parseInt(document.getElementById('word-count').value);
        
        // Shuffle and select word pairs
        this.studyPairs = this.shuffleArray([...this.wordPairs]).slice(0, this.settings.wordCount);
        
        // Reset counters
        this.currentStudyIndex = 0;
        this.currentRecallIndex = 0;
        this.userAnswers = [];
        
        // Start study phase
        this.showScreen('study-screen');
        this.startStudyPhase();
    }

    shuffleArray(array) {
        // Fisher-Yates shuffle
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    async startStudyPhase() {
        for (let i = 0; i < this.studyPairs.length; i++) {
            this.currentStudyIndex = i;
            await this.showStudyPair(this.studyPairs[i]);
        }
        this.startRecallPhase();
    }

    async showStudyPair(pair) {
        // Update progress
        this.updateStudyProgress();
        
        // Display words
        document.getElementById('swahili-word').textContent = pair.q;
        document.getElementById('english-word').textContent = pair.a;
        
        // Speech synthesis for audio + visual condition
        if (this.settings.condition === 'audio-visual') {
            this.speakWithDelay(pair.q, pair.a);
        }
        
        // Timer countdown
        await this.startTimer();
    }

    speak(text) {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 0.8;
            utterance.pitch = 1;
            speechSynthesis.speak(utterance);
        }
    }

    speakWithDelay(swahiliWord, englishWord) {
        if ('speechSynthesis' in window) {
            // Speak Swahili word first
            const swahiliUtterance = new SpeechSynthesisUtterance(swahiliWord);
            swahiliUtterance.rate = 0.8;
            swahiliUtterance.pitch = 1;
            speechSynthesis.speak(swahiliUtterance);
            
            // Wait for Swahili word to finish, then add delay before English
            swahiliUtterance.onend = () => {
                setTimeout(() => {
                    const englishUtterance = new SpeechSynthesisUtterance(englishWord);
                    englishUtterance.rate = 0.8;
                    englishUtterance.pitch = 1;
                    speechSynthesis.speak(englishUtterance);
                }, 500); // 500ms delay between words
            };
        }
    }

    async startTimer() {
        return new Promise(resolve => {
            let timeLeft = this.settings.timePerPair;
            document.getElementById('timer-text').textContent = timeLeft;
            
            const interval = setInterval(() => {
                timeLeft--;
                document.getElementById('timer-text').textContent = timeLeft;
                
                if (timeLeft <= 0) {
                    clearInterval(interval);
                    resolve();
                }
            }, 1000);
        });
    }

    updateStudyProgress() {
        const progress = ((this.currentStudyIndex + 1) / this.studyPairs.length) * 100;
        document.getElementById('progress-fill').style.width = `${progress}%`;
        document.getElementById('progress-text').textContent = 
            `${this.currentStudyIndex + 1} / ${this.studyPairs.length}`;
    }

    startRecallPhase() {
        this.showScreen('recall-screen');
        this.currentRecallIndex = 0;
        // Shuffle the order for recall phase to make it more challenging
        this.recallPairs = this.shuffleArray([...this.studyPairs]);
        this.showRecallQuestion();
    }

    showRecallQuestion() {
        if (this.currentRecallIndex >= this.recallPairs.length) {
            this.showResults();
            return;
        }

        const pair = this.recallPairs[this.currentRecallIndex];
        document.getElementById('recall-swahili').textContent = pair.q;
        document.getElementById('recall-input').value = '';
        document.getElementById('recall-input').focus();
        
        // Update progress
        document.getElementById('recall-progress').textContent = 
            `Question ${this.currentRecallIndex + 1} / ${this.recallPairs.length}`;
    }

    submitAnswer() {
        const userAnswer = document.getElementById('recall-input').value.trim().toLowerCase();
        const correctAnswer = this.recallPairs[this.currentRecallIndex].a.trim().toLowerCase();
        
        this.userAnswers.push({
            swahili: this.recallPairs[this.currentRecallIndex].q,
            correctAnswer: this.recallPairs[this.currentRecallIndex].a,
            userAnswer: document.getElementById('recall-input').value.trim(),
            isCorrect: userAnswer === correctAnswer
        });
        
        this.currentRecallIndex++;
        this.showRecallQuestion();
    }

    skipAnswer() {
        this.userAnswers.push({
            swahili: this.recallPairs[this.currentRecallIndex].q,
            correctAnswer: this.recallPairs[this.currentRecallIndex].a,
            userAnswer: '',
            isCorrect: false
        });
        
        this.currentRecallIndex++;
        this.showRecallQuestion();
    }

    showResults() {
        this.showScreen('results-screen');
        
        const correctCount = this.userAnswers.filter(answer => answer.isCorrect).length;
        const totalCount = this.userAnswers.length;
        const percentage = Math.round((correctCount / totalCount) * 100);
        
        document.getElementById('score-display').textContent = `${correctCount} / ${totalCount}`;
        document.querySelector('.score-percentage').textContent = `${percentage}% correct`;
        
        // Show missed words
        const missedWords = this.userAnswers.filter(answer => !answer.isCorrect);
        const missedList = document.getElementById('missed-list');
        
        if (missedWords.length === 0) {
            missedList.innerHTML = '<p style="text-align: center; color: #48bb78; font-weight: 500;">Perfect score! 🎉</p>';
        } else {
            missedList.innerHTML = missedWords.map(word => `
                <div class="missed-item">
                    <span class="missed-swahili">${word.swahili}</span>
                    <span class="missed-english">${word.correctAnswer}</span>
                </div>
            `).join('');
        }
        
        // Save results to localStorage
        this.saveResults(correctCount, totalCount, percentage);
    }

    saveResults(correct, total, percentage) {
        const results = {
            date: new Date().toISOString(),
            condition: this.settings.condition,
            wordCount: this.settings.wordCount,
            timePerPair: this.settings.timePerPair,
            correct: correct,
            total: total,
            percentage: percentage
        };
        
        const allResults = JSON.parse(localStorage.getItem('memoryTestResults') || '[]');
        allResults.push(results);
        localStorage.setItem('memoryTestResults', JSON.stringify(allResults));
    }

    restart() {
        this.showScreen('welcome-screen');
        this.currentStudyIndex = 0;
        this.currentRecallIndex = 0;
        this.userAnswers = [];
        
        // Reset progress bar
        document.getElementById('progress-fill').style.width = '0%';
    }

    showScreen(screenId) {
        // Hide all screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.add('hidden');
        });
        
        // Show target screen
        document.getElementById(screenId).classList.remove('hidden');
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MemoryTest();
});