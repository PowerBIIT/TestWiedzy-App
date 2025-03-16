/**
 * Main script file for quiz functionality
 */

// Quiz state
const quizState = {
    questions: [],
    currentQuestionIndex: 0,
    score: 0,
    selectedAnswer: null,
    quizStarted: false,
    quizFinished: false
};

// DOM elements
const elements = {
    startScreen: document.getElementById('start-screen'),
    quizContainer: document.getElementById('quiz-container'),
    resultsScreen: document.getElementById('results-screen'),
    
    startBtn: document.getElementById('start-btn'),
    nextBtn: document.getElementById('next-btn'),
    restartBtn: document.getElementById('restart-btn'),
    errorMessage: document.getElementById('error-message'),
    
    questionNumber: document.getElementById('question-number'),
    questionText: document.getElementById('question-text'),
    optionsContainer: document.getElementById('options-container'),
    scoreElement: document.getElementById('score'),
    
    progressBar: document.getElementById('progress-bar'),
    finalScore: document.getElementById('final-score'),
    finalProgressBar: document.getElementById('final-progress-bar'),
    
    // Nowe elementy konfiguracyjne
    currentFile: document.getElementById('current-file'),
    currentCount: document.getElementById('current-count'),
    resultContainer: document.getElementById('result-container'),
    scoreDisplay: document.getElementById('score-display'),
    percentageDisplay: document.getElementById('percentage-display'),
    resultsProgress: document.getElementById('results-progress')
};

// Na początku pliku dodaję tablicę z komunikatami motywacyjnymi
const motivationalMessages = [
    "Świetnie! Tak trzymaj!",
    "Doskonale! Jesteś na dobrej drodze!",
    "Brawo! Kontynuuj w tym tempie!",
    "Fantastycznie! Robisz postępy!",
    "Wspaniale! Twoja wiedza jest imponująca!",
    "Niesamowite! Widać, że się uczysz!",
    "Dokładnie tak! Dobra robota!",
    "Perfekcyjnie! Masz to opanowane!",
    "Znakomicie! Idzie Ci coraz lepiej!",
    "Rewelacyjnie! Wiedza sama wchodzi do głowy!"
];

/**
 * Funkcja do logowania z timestampem
 * @param {string} message - Wiadomość do zalogowania
 * @param {string} level - Poziom logowania (info, warn, error)
 */
function logWithTimestamp(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [QUIZ] ${message}`;
    
    switch(level) {
        case 'error':
            console.error(logMessage);
            break;
        case 'warn':
            console.warn(logMessage);
            break;
        default:
            console.log(logMessage);
    }
}

/**
 * Wyświetla komunikat błędu
 * @param {string} message - Treść komunikatu błędu
 */
function showError(message) {
    logWithTimestamp(`Wyświetlam błąd: ${message}`, 'error');
    elements.errorMessage.textContent = message;
    elements.errorMessage.classList.remove('d-none');
    setTimeout(() => {
        elements.errorMessage.classList.add('d-none');
    }, 5000); // Ukryj komunikat po 5 sekundach
}

/**
 * Initialize the quiz application
 */
async function initQuiz() {
    logWithTimestamp('Inicjalizacja aplikacji quizowej');
    
    // Sprawdź, czy wszystkie elementy DOM zostały znalezione
    const missingElements = Object.entries(elements)
        .filter(([key, element]) => !element)
        .map(([key]) => key);
    
    if (missingElements.length > 0) {
        logWithTimestamp(`Nie znaleziono następujących elementów DOM: ${missingElements.join(', ')}`, 'error');
    }
    
    // Przygotuj przykładowe pliki
    if (window.quizAPI && window.quizAPI.createSampleFiles) {
        logWithTimestamp('Przygotowywanie przykładowych plików');
        try {
            await window.quizAPI.createSampleFiles();
            logWithTimestamp('Przykładowe pliki zostały przygotowane');
        } catch (error) {
            logWithTimestamp(`Błąd podczas przygotowywania przykładowych plików: ${error.message}`, 'error');
        }
    } else {
        logWithTimestamp('Funkcja createSampleFiles nie jest dostępna', 'warn');
    }
    
    // Pobierz konfigurację
    logWithTimestamp('Aktualizacja wyświetlania konfiguracji');
    updateConfigDisplay();
    
    // Set up event listeners
    logWithTimestamp('Ustawianie nasłuchiwania zdarzeń');
    elements.startBtn.addEventListener('click', startQuiz);
    elements.nextBtn.addEventListener('click', nextQuestion);
    elements.restartBtn.addEventListener('click', restartQuiz);
    
    // Add loading indicator to start button
    elements.startBtn.innerHTML = 'Rozpocznij Quiz';
    
    // Try to preload questions
    try {
        logWithTimestamp('Próba wstępnego załadowania pytań');
        await window.quizAPI.loadQuestions();
        logWithTimestamp('Pytania zostały wstępnie załadowane');
    } catch (error) {
        logWithTimestamp(`Nie udało się wstępnie załadować pytań: ${error.message}`, 'error');
        // Nie pokazujemy błędu tutaj, spróbujemy załadować ponownie podczas startQuiz
    }
    
    logWithTimestamp('Inicjalizacja aplikacji quizowej zakończona');
}

/**
 * Aktualizuje wyświetlanie informacji o konfiguracji
 */
function updateConfigDisplay() {
    if (window.quizConfig) {
        const config = window.quizConfig.getConfig();
        logWithTimestamp(`Aktualizacja wyświetlania konfiguracji: ${JSON.stringify(config)}`);
        
        if (elements.currentFile) {
            elements.currentFile.textContent = config.questionFile || 'Janko.csv';
        }
        
        if (elements.currentCount) {
            elements.currentCount.textContent = config.questionCount || 20;
        }
    } else {
        logWithTimestamp('Nie można zaktualizować wyświetlania konfiguracji - window.quizConfig nie istnieje', 'warn');
    }
}

/**
 * Start the quiz
 */
async function startQuiz() {
    logWithTimestamp('Rozpoczynanie quizu...');
    
    // Pobierz aktualną konfigurację
    const currentConfig = window.quizConfig ? window.quizConfig.getConfig() : { questionFile: 'Janko.csv' };
    logWithTimestamp(`Konfiguracja przy starcie quizu: ${JSON.stringify(currentConfig)}`);
    logWithTimestamp(`Używany plik z pytaniami: ${currentConfig.questionFile}`);
    
    // Dodaj wskaźnik ładowania
    elements.startBtn.innerHTML = 'Ładowanie pytań... <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>';
    elements.startBtn.disabled = true;
    elements.errorMessage.classList.add('d-none');
    
    try {
        // Sprawdź dostępność API
        if (!window.quizAPI) {
            throw new Error('API quizu nie jest dostępne');
        }
        
        // Zawsze ładuj pytania od nowa przy starcie quizu
        logWithTimestamp('Ładowanie pytań z pliku konfiguracyjnego');
        await window.quizAPI.loadQuestions();
        
        quizState.questions = window.quizAPI.getQuestions();
        logWithTimestamp(`Załadowano ${quizState.questions.length} pytań`);
        
        if (quizState.questions.length === 0) {
            throw new Error('Nie znaleziono żadnych pytań');
        }
        
        // Reset quiz state
        quizState.currentQuestionIndex = 0;
        quizState.score = 0;
        quizState.quizStarted = true;
        quizState.quizFinished = false;
        logWithTimestamp('Stan quizu został zresetowany');
        
        // Update UI
        elements.startScreen.classList.add('d-none');
        elements.quizContainer.classList.remove('d-none');
        elements.resultsScreen.classList.add('d-none');
        logWithTimestamp('Interfejs został zaktualizowany - wyświetlanie quizu');
        
        // Load first question
        loadQuestion();
    } catch (error) {
        logWithTimestamp(`Błąd podczas rozpoczynania quizu: ${error.message}`, 'error');
        showError('Nie udało się załadować pytań. Spróbuj odświeżyć stronę. Szczegóły błędu: ' + error.message);
        // Przywróć przycisk do stanu początkowego
        elements.startBtn.innerHTML = 'Rozpocznij Quiz';
        elements.startBtn.disabled = false;
    }
}

/**
 * Load the current question
 */
function loadQuestion() {
    const question = quizState.questions[quizState.currentQuestionIndex];
    logWithTimestamp(`Ładowanie pytania ${quizState.currentQuestionIndex + 1}/${quizState.questions.length}`);
    
    // Update question text
    elements.questionText.textContent = question.question;
    
    // Update question number
    elements.questionNumber.textContent = `Pytanie ${quizState.currentQuestionIndex + 1}/${quizState.questions.length}`;
    
    // Update score
    elements.scoreElement.textContent = `Wynik: ${quizState.score}`;
    
    // Update progress bar with animation
    const progress = (quizState.currentQuestionIndex / quizState.questions.length) * 100;
    elements.progressBar.style.transition = 'width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)';
    elements.progressBar.style.width = `${progress}%`;
    
    // Zmiana koloru paska postępu w zależności od progresu
    if (progress < 30) {
        elements.progressBar.style.backgroundColor = '#007bff'; // niebieski
    } else if (progress < 70) {
        elements.progressBar.style.backgroundColor = '#28a745'; // zielony
    } else {
        elements.progressBar.style.backgroundColor = '#ffc107'; // żółty
    }
    
    // Dodanie emoji do paska postępu
    const progressEmoji = document.getElementById('progress-emoji');
    if (!progressEmoji) {
        const emoji = document.createElement('div');
        emoji.id = 'progress-emoji';
        emoji.style.position = 'absolute';
        emoji.style.top = '-25px';
        emoji.style.fontSize = '20px';
        emoji.style.transition = 'left 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)';
        emoji.innerHTML = '🏃';
        elements.progressBar.parentElement.style.position = 'relative';
        elements.progressBar.parentElement.appendChild(emoji);
    }
    
    // Aktualizacja pozycji emoji
    const emoji = document.getElementById('progress-emoji');
    emoji.style.left = `${progress}%`;
    
    // Zmiana emoji w zależności od progresu
    if (progress < 30) {
        emoji.innerHTML = '🏃';
    } else if (progress < 70) {
        emoji.innerHTML = '🚶';
    } else if (progress < 95) {
        emoji.innerHTML = '👟';
    } else {
        emoji.innerHTML = '🏁';
    }
    
    // Clear previous options
    elements.optionsContainer.innerHTML = '';
    
    // Create option buttons
    logWithTimestamp(`Tworzenie przycisków opcji dla pytania ${quizState.currentQuestionIndex + 1}`);
    question.options.forEach((option) => {
        const button = document.createElement('button');
        button.classList.add('btn', 'btn-outline-primary', 'option');
        button.textContent = `${option.id}. ${option.text}`;
        button.dataset.id = option.id;
        
        button.addEventListener('click', () => selectAnswer(option.id));
        
        elements.optionsContainer.appendChild(button);
    });
    
    // Hide the next button
    elements.nextBtn.classList.add('d-none');
    
    logWithTimestamp(`Pytanie ${quizState.currentQuestionIndex + 1} zostało załadowane`);
}

/**
 * Handle answer selection
 * @param {string} answerId - The ID of the selected answer (A, B, C, or D)
 */
function selectAnswer(answerId) {
    logWithTimestamp(`Wybrano odpowiedź: ${answerId}`);
    
    // Prevent selection after answer is already chosen
    if (quizState.selectedAnswer) {
        logWithTimestamp('Odpowiedź już została wybrana, ignorowanie wyboru', 'warn');
        return;
    }
    
    const question = quizState.questions[quizState.currentQuestionIndex];
    const isCorrect = answerId === question.correctAnswer;
    
    // Store the selection
    quizState.selectedAnswer = answerId;
    
    // Update score if correct
    if (isCorrect) {
        quizState.score++;
        elements.scoreElement.textContent = `Wynik: ${quizState.score}`;
        logWithTimestamp(`Odpowiedź poprawna! Nowy wynik: ${quizState.score}`);
        
        // Dodane efekty motywacyjne przy poprawnej odpowiedzi
        showConfetti();
        showMotivationalMessage();
    } else {
        logWithTimestamp(`Odpowiedź niepoprawna. Poprawna odpowiedź to: ${question.correctAnswer}`);
    }
    
    // Highlight options
    const options = elements.optionsContainer.querySelectorAll('.option');
    options.forEach(option => {
        const optionId = option.dataset.id;
        
        // Disable all options
        option.disabled = true;
        
        // Style the selected and correct options
        if (optionId === answerId) {
            option.classList.add(isCorrect ? 'correct' : 'incorrect');
        } else if (optionId === question.correctAnswer) {
            option.classList.add('correct');
        }
    });
    
    // Show next button
    elements.nextBtn.classList.remove('d-none');
    
    // If last question, change next button text
    if (quizState.currentQuestionIndex === quizState.questions.length - 1) {
        elements.nextBtn.textContent = 'Zakończ quiz';
        logWithTimestamp('Ostatnie pytanie - zmiana tekstu przycisku na "Zakończ quiz"');
    }
}

/**
 * Move to next question or finish quiz
 */
function nextQuestion() {
    logWithTimestamp('Przejście do następnego pytania');
    
    // Reset selection
    quizState.selectedAnswer = null;
    
    // Check if last question
    if (quizState.currentQuestionIndex === quizState.questions.length - 1) {
        logWithTimestamp('Ostatnie pytanie - kończenie quizu');
        finishQuiz();
        return;
    }
    
    // Move to next question
    quizState.currentQuestionIndex++;
    logWithTimestamp(`Przejście do pytania ${quizState.currentQuestionIndex + 1}`);
    loadQuestion();
}

/**
 * Finish the quiz and show results
 */
function finishQuiz() {
    logWithTimestamp('Kończenie quizu i wyświetlanie wyników');
    quizState.quizFinished = true;
    
    // Update UI
    elements.quizContainer.classList.add('d-none');
    elements.resultsScreen.classList.remove('d-none');
    
    // Calculate percentage
    const percentage = (quizState.score / quizState.questions.length) * 100;
    logWithTimestamp(`Wynik końcowy: ${quizState.score}/${quizState.questions.length} (${percentage.toFixed(0)}%)`);
    
    // Update final score
    elements.finalScore.textContent = `Twój wynik: ${quizState.score}/${quizState.questions.length} (${percentage.toFixed(0)}%)`;
    
    // Update final progress bar
    elements.finalProgressBar.style.width = `${percentage}%`;
    
    // Set progress bar color based on score
    if (percentage < 50) {
        elements.finalProgressBar.classList.add('bg-danger');
        logWithTimestamp('Wynik poniżej 50% - czerwony pasek postępu');
    } else if (percentage < 75) {
        elements.finalProgressBar.classList.add('bg-warning');
        logWithTimestamp('Wynik pomiędzy 50% a 75% - żółty pasek postępu');
    } else {
        elements.finalProgressBar.classList.add('bg-success');
        logWithTimestamp('Wynik powyżej 75% - zielony pasek postępu');
    }
    
    // Show results
    showResults();
}

/**
 * Restart the quiz
 */
function restartQuiz() {
    logWithTimestamp('Restartowanie quizu');
    
    // Reset UI
    elements.finalProgressBar.classList.remove('bg-danger', 'bg-warning', 'bg-success');
    
    // Przeładuj konfigurację i zaktualizuj wyświetlanie
    if (window.quizConfig) {
        const config = window.quizConfig.getConfig();
        logWithTimestamp(`Aktualna konfiguracja przy restarcie: ${JSON.stringify(config)}`);
    }
    updateConfigDisplay();
    
    // Wyczyść bufor pytań, aby wymusić ich ponowne załadowanie
    quizState.questions = [];
    
    // Start quiz again
    startQuiz();
}

// Initialize the quiz when the document is loaded
document.addEventListener('DOMContentLoaded', initQuiz);

function initLogging() {
    // Upewnij się, że mamy element dla logów
    if (!document.getElementById('admin-log')) {
        console.log("Element admin-log nie istnieje - brak logowania w interfejsie");
        return;
    }
    
    // Nadpisz konsolę tylko jeśli jesteśmy w panelu admin
    const oldLog = console.log;
    const oldWarn = console.warn;
    const oldError = console.error;
    
    console.log = function(message) {
        logWithTimestamp(message, 'info');
        oldLog.apply(console, arguments);
    };
    
    console.warn = function(message) {
        logWithTimestamp(message, 'warn');
        oldWarn.apply(console, arguments);
    };
    
    console.error = function(message) {
        logWithTimestamp(message, 'error');
        oldError.apply(console, arguments);
    };
    
    logWithTimestamp('Inicjalizacja systemu logowania');
}

// Funkcja pomocnicza do logowania z timestampem
function logWithTimestamp(message, type = 'info') {
    const logElement = document.getElementById('admin-log');
    if (!logElement) return;
    
    const now = new Date();
    const timestamp = now.toLocaleTimeString('pl-PL', { hour12: false }) + '.' + 
                    String(now.getMilliseconds()).padStart(3, '0');
    
    const entry = document.createElement('div');
    entry.className = `log-entry log-${type}`;
    entry.innerHTML = `<span class="log-time">${timestamp}</span> <span class="log-msg">${message}</span>`;
    
    logElement.appendChild(entry);
    logElement.scrollTop = logElement.scrollHeight;
}

// Funkcja do pokazywania konfetti
function showConfetti() {
    const canvas = document.createElement('canvas');
    canvas.id = 'confetti-canvas';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '1000';
    document.body.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const particles = [];
    const particleCount = 100;
    const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#4CAF50', '#8BC34A'];
    
    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height - canvas.height;
            this.size = Math.random() * 8 + 4;
            this.weight = Math.random() * 2 + 0.1;
            this.color = colors[Math.floor(Math.random() * colors.length)];
            this.directionX = Math.random() * 1 - 0.5;
        }
        
        update() {
            this.y += this.weight;
            this.x += this.directionX;
            
            if (this.y > canvas.height) {
                this.y = -10;
                this.x = Math.random() * canvas.width;
                this.weight = Math.random() * 2 + 0.1;
                this.directionX = Math.random() * 1 - 0.5;
            }
        }
        
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
        }
    }
    
    function init() {
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();
        }
        
        requestAnimationFrame(animate);
    }
    
    init();
    animate();
    
    // Usuń konfetti po 3 sekundach
    setTimeout(() => {
        document.body.removeChild(canvas);
    }, 3000);
}

// Funkcja do wyświetlania motywacyjnego komunikatu
function showMotivationalMessage() {
    const message = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
    
    const messageElement = document.createElement('div');
    messageElement.classList.add('motivational-message');
    messageElement.textContent = message;
    messageElement.style.position = 'fixed';
    messageElement.style.top = '30%';
    messageElement.style.left = '50%';
    messageElement.style.transform = 'translate(-50%, -50%)';
    messageElement.style.backgroundColor = 'rgba(40, 167, 69, 0.9)';
    messageElement.style.color = 'white';
    messageElement.style.padding = '15px 30px';
    messageElement.style.borderRadius = '10px';
    messageElement.style.fontSize = '24px';
    messageElement.style.fontWeight = 'bold';
    messageElement.style.zIndex = '1001';
    messageElement.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
    messageElement.style.animation = 'fadeInOut 2s ease';
    
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeInOut {
            0% { opacity: 0; transform: translate(-50%, -50%) scale(0.7); }
            20% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
            30% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            100% { opacity: 0; transform: translate(-50%, -50%) scale(0.7); }
        }
    `;
    document.head.appendChild(style);
    document.body.appendChild(messageElement);
    
    // Usuń komunikat po 2 sekundach
    setTimeout(() => {
        document.body.removeChild(messageElement);
    }, 2000);
}

/**
 * Show results screen
 */
function showResults() {
    logWithTimestamp('Wyświetlanie ekranu wyników');
    
    elements.quizContainer.classList.add('d-none');
    elements.resultContainer.classList.remove('d-none');
    
    const totalQuestions = quizState.questions.length;
    const scorePercentage = Math.round((quizState.score / totalQuestions) * 100);
    
    elements.scoreDisplay.textContent = `${quizState.score}/${totalQuestions}`;
    elements.percentageDisplay.textContent = `${scorePercentage}%`;
    
    // Animate results progress bar
    elements.resultsProgress.style.transition = 'width 1.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
    setTimeout(() => {
        elements.resultsProgress.style.width = `${scorePercentage}%`;
    }, 100);
    
    // Zmień kolor paska wyników w zależności od wyniku
    if (scorePercentage < 40) {
        elements.resultsProgress.style.backgroundColor = '#dc3545'; // czerwony
    } else if (scorePercentage < 70) {
        elements.resultsProgress.style.backgroundColor = '#ffc107'; // żółty
    } else {
        elements.resultsProgress.style.backgroundColor = '#28a745'; // zielony
    }
    
    // Wyświetl odpowiednią wiadomość i efekt w zależności od wyniku
    let resultMessage = '';
    if (scorePercentage >= 90) {
        resultMessage = 'Doskonały wynik! Jesteś ekspertem!';
        // Dodaj efekt konfetti dla wysokiego wyniku
        showConfetti();
        showTrophy();
    } else if (scorePercentage >= 70) {
        resultMessage = 'Bardzo dobry wynik! Prawie wszystko wiesz!';
        showConfetti();
    } else if (scorePercentage >= 50) {
        resultMessage = 'Dobry wynik! Nie jest źle!';
    } else {
        resultMessage = 'Warto jeszcze poćwiczyć. Próbuj dalej!';
    }
    
    // Dodaj element z wiadomością wynikową
    const resultMessageElement = document.createElement('p');
    resultMessageElement.classList.add('mt-3', 'text-center', 'lead');
    resultMessageElement.textContent = resultMessage;
    
    // Sprawdź, czy element już istnieje
    const existingMessage = elements.resultContainer.querySelector('.result-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    resultMessageElement.classList.add('result-message');
    elements.resultContainer.querySelector('.card-body').appendChild(resultMessageElement);
    
    logWithTimestamp(`Wyniki: ${quizState.score}/${totalQuestions} (${scorePercentage}%)`);
}

// Funkcja wyświetlająca animowany puchar dla najlepszych wyników
function showTrophy() {
    const trophy = document.createElement('div');
    trophy.id = 'trophy';
    trophy.innerHTML = '🏆';
    trophy.style.position = 'fixed';
    trophy.style.top = '20%';
    trophy.style.left = '50%';
    trophy.style.transform = 'translate(-50%, -50%) scale(0)';
    trophy.style.fontSize = '100px';
    trophy.style.zIndex = '1001';
    trophy.style.textShadow = '0 0 20px rgba(255, 215, 0, 0.8)';
    trophy.style.animation = 'trophyAnimation 3s ease forwards';
    
    const style = document.createElement('style');
    style.textContent = `
        @keyframes trophyAnimation {
            0% { transform: translate(-50%, -50%) scale(0) rotate(0deg); }
            40% { transform: translate(-50%, -50%) scale(1.2) rotate(10deg); }
            50% { transform: translate(-50%, -50%) scale(1) rotate(-10deg); }
            60% { transform: translate(-50%, -50%) scale(1.1) rotate(5deg); }
            70% { transform: translate(-50%, -50%) scale(1) rotate(-5deg); }
            80% { transform: translate(-50%, -50%) scale(1.05) rotate(0deg); }
            100% { transform: translate(-50%, -50%) scale(1) rotate(0deg); }
        }
    `;
    document.head.appendChild(style);
    document.body.appendChild(trophy);
    
    setTimeout(() => {
        trophy.style.animation = 'bounceOut 1s forwards';
        const bounceStyle = document.createElement('style');
        bounceStyle.textContent = `
            @keyframes bounceOut {
                0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
                100% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
            }
        `;
        document.head.appendChild(bounceStyle);
        
        setTimeout(() => {
            document.body.removeChild(trophy);
        }, 1000);
    }, 4000);
} 