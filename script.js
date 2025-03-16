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
    currentCount: document.getElementById('current-count')
};

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
            elements.currentFile.textContent = config.questionFile || 'Pytania.csv';
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
    logWithTimestamp('Rozpoczynanie quizu');
    
    // Dodaj wskaźnik ładowania
    elements.startBtn.innerHTML = 'Ładowanie pytań... <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>';
    elements.startBtn.disabled = true;
    elements.errorMessage.classList.add('d-none');
    
    try {
        // Get questions if not already loaded
        if (!window.quizAPI) {
            throw new Error('API quizu nie jest dostępne');
        }
        
        logWithTimestamp('Sprawdzanie dostępności pytań');
        if (window.quizAPI.getQuestions().length === 0) {
            logWithTimestamp('Brak załadowanych pytań, ładowanie pytań');
            await window.quizAPI.loadQuestions();
        }
        
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
    
    // Update progress bar
    const progress = (quizState.currentQuestionIndex / quizState.questions.length) * 100;
    elements.progressBar.style.width = `${progress}%`;
    
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
}

/**
 * Restart the quiz
 */
function restartQuiz() {
    logWithTimestamp('Restartowanie quizu');
    
    // Reset UI
    elements.finalProgressBar.classList.remove('bg-danger', 'bg-warning', 'bg-success');
    
    // Aktualizuj konfigurację (w przypadku zmian)
    updateConfigDisplay();
    
    // Start quiz again
    startQuiz();
}

// Initialize the quiz when the document is loaded
document.addEventListener('DOMContentLoaded', initQuiz); 