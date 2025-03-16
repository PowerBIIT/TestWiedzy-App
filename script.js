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
 * Wyświetla komunikat błędu
 * @param {string} message - Treść komunikatu błędu
 */
function showError(message) {
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
    // Przygotuj przykładowe pliki
    if (window.quizAPI && window.quizAPI.createSampleFiles) {
        await window.quizAPI.createSampleFiles();
    }
    
    // Pobierz konfigurację
    updateConfigDisplay();
    
    // Set up event listeners
    elements.startBtn.addEventListener('click', startQuiz);
    elements.nextBtn.addEventListener('click', nextQuestion);
    elements.restartBtn.addEventListener('click', restartQuiz);
    
    // Add loading indicator to start button
    elements.startBtn.innerHTML = 'Rozpocznij Quiz';
    
    // Try to preload questions
    try {
        await window.quizAPI.loadQuestions();
        console.log('Questions loaded successfully');
    } catch (error) {
        console.error('Failed to preload questions:', error);
        // Nie pokazujemy błędu tutaj, spróbujemy załadować ponownie podczas startQuiz
    }
}

/**
 * Aktualizuje wyświetlanie informacji o konfiguracji
 */
function updateConfigDisplay() {
    if (window.quizConfig) {
        const config = window.quizConfig.getConfig();
        
        if (elements.currentFile) {
            elements.currentFile.textContent = config.questionFile || 'Pytania.md';
        }
        
        if (elements.currentCount) {
            elements.currentCount.textContent = config.questionCount || 20;
        }
    }
}

/**
 * Start the quiz
 */
async function startQuiz() {
    // Dodaj wskaźnik ładowania
    elements.startBtn.innerHTML = 'Ładowanie pytań... <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>';
    elements.startBtn.disabled = true;
    elements.errorMessage.classList.add('d-none');
    
    try {
        // Get questions if not already loaded
        if (window.quizAPI.getQuestions().length === 0) {
            await window.quizAPI.loadQuestions();
        }
        
        quizState.questions = window.quizAPI.getQuestions();
        
        if (quizState.questions.length === 0) {
            throw new Error('Nie znaleziono żadnych pytań');
        }
        
        // Reset quiz state
        quizState.currentQuestionIndex = 0;
        quizState.score = 0;
        quizState.quizStarted = true;
        quizState.quizFinished = false;
        
        // Update UI
        elements.startScreen.classList.add('d-none');
        elements.quizContainer.classList.remove('d-none');
        elements.resultsScreen.classList.add('d-none');
        
        // Load first question
        loadQuestion();
    } catch (error) {
        console.error('Failed to start quiz:', error);
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
}

/**
 * Handle answer selection
 * @param {string} answerId - The ID of the selected answer (A, B, C, or D)
 */
function selectAnswer(answerId) {
    // Prevent selection after answer is already chosen
    if (quizState.selectedAnswer) {
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
    }
}

/**
 * Move to next question or finish quiz
 */
function nextQuestion() {
    // Reset selection
    quizState.selectedAnswer = null;
    
    // Check if last question
    if (quizState.currentQuestionIndex === quizState.questions.length - 1) {
        finishQuiz();
        return;
    }
    
    // Move to next question
    quizState.currentQuestionIndex++;
    loadQuestion();
}

/**
 * Finish the quiz and show results
 */
function finishQuiz() {
    quizState.quizFinished = true;
    
    // Update UI
    elements.quizContainer.classList.add('d-none');
    elements.resultsScreen.classList.remove('d-none');
    
    // Calculate percentage
    const percentage = (quizState.score / quizState.questions.length) * 100;
    
    // Update final score
    elements.finalScore.textContent = `Twój wynik: ${quizState.score}/${quizState.questions.length} (${percentage.toFixed(0)}%)`;
    
    // Update final progress bar
    elements.finalProgressBar.style.width = `${percentage}%`;
    
    // Set progress bar color based on score
    if (percentage < 50) {
        elements.finalProgressBar.classList.add('bg-danger');
    } else if (percentage < 75) {
        elements.finalProgressBar.classList.add('bg-warning');
    } else {
        elements.finalProgressBar.classList.add('bg-success');
    }
}

/**
 * Restart the quiz
 */
function restartQuiz() {
    // Reset UI
    elements.finalProgressBar.classList.remove('bg-danger', 'bg-warning', 'bg-success');
    
    // Aktualizuj konfigurację (w przypadku zmian)
    updateConfigDisplay();
    
    // Start quiz again
    startQuiz();
}

// Initialize the quiz when the document is loaded
document.addEventListener('DOMContentLoaded', initQuiz); 