/**
 * Moduł do zarządzania konfiguracją quizu
 */

// Domyślna konfiguracja
const defaultConfig = {
    questionFile: 'Pytania.csv',
    questionCount: 20,
    shuffleQuestions: true
};

// Aktualna konfiguracja
let currentConfig = { ...defaultConfig };

/**
 * Funkcja do logowania z timestampem
 * @param {string} message - Wiadomość do zalogowania
 * @param {string} level - Poziom logowania (info, warn, error)
 */
function logWithTimestamp(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [CONFIG] ${message}`;
    
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
 * Sprawdza, czy localStorage jest dostępny
 * @returns {boolean} Czy localStorage jest dostępny
 */
function isLocalStorageAvailable() {
    try {
        const testKey = 'test_localStorage';
        localStorage.setItem(testKey, testKey);
        const result = localStorage.getItem(testKey) === testKey;
        localStorage.removeItem(testKey);
        logWithTimestamp('Test localStorage: ' + (result ? 'dostępny' : 'niedostępny'));
        return result;
    } catch (e) {
        logWithTimestamp('localStorage nie jest dostępny: ' + e.message, 'error');
        return false;
    }
}

/**
 * Zapisuje konfigurację do localStorage
 */
function saveConfig() {
    logWithTimestamp('Próba zapisania konfiguracji do localStorage...');
    
    if (!isLocalStorageAvailable()) {
        logWithTimestamp('Nie można zapisać konfiguracji - localStorage niedostępny', 'error');
        return false;
    }
    
    try {
        localStorage.setItem('quizConfig', JSON.stringify(currentConfig));
        logWithTimestamp('Konfiguracja zapisana w localStorage: ' + JSON.stringify(currentConfig));
        return true;
    } catch (error) {
        logWithTimestamp('Błąd podczas zapisywania konfiguracji do localStorage: ' + error.message, 'error');
        return false;
    }
}

/**
 * Wczytuje konfigurację z localStorage
 * @returns {Object} Konfiguracja
 */
function loadConfig() {
    logWithTimestamp('Próba wczytania konfiguracji z localStorage...');
    
    if (!isLocalStorageAvailable()) {
        logWithTimestamp('Nie można wczytać konfiguracji - localStorage niedostępny', 'error');
        logWithTimestamp('Używam domyślnej konfiguracji: ' + JSON.stringify(defaultConfig));
        return { ...defaultConfig };
    }
    
    try {
        const storedConfig = localStorage.getItem('quizConfig');
        
        if (storedConfig) {
            const parsedConfig = JSON.parse(storedConfig);
            logWithTimestamp('Wczytana konfiguracja z localStorage: ' + JSON.stringify(parsedConfig));
            return parsedConfig;
        } else {
            logWithTimestamp('Brak zapisanej konfiguracji. Używam domyślnej: ' + JSON.stringify(defaultConfig));
            return { ...defaultConfig };
        }
    } catch (error) {
        logWithTimestamp('Błąd podczas wczytywania konfiguracji z localStorage: ' + error.message, 'error');
        logWithTimestamp('Używam domyślnej konfiguracji: ' + JSON.stringify(defaultConfig));
        return { ...defaultConfig };
    }
}

/**
 * Aktualizuje konfigurację
 * @param {Object} newConfig - Nowa konfiguracja
 * @returns {Object} Zaktualizowana konfiguracja
 */
function updateConfig(newConfig) {
    logWithTimestamp('Aktualizacja konfiguracji. Otrzymano: ' + JSON.stringify(newConfig));
    
    if (typeof newConfig !== 'object') {
        logWithTimestamp('Nieprawidłowy format konfiguracji: ' + typeof newConfig, 'error');
        return currentConfig;
    }
    
    if (newConfig.questionCount !== undefined) {
        // Sprawdź, czy questionCount jest liczbą
        const count = parseInt(newConfig.questionCount, 10);
        if (isNaN(count) || count < 1) {
            logWithTimestamp('Nieprawidłowa wartość questionCount: ' + newConfig.questionCount, 'error');
            return currentConfig;
        }
        newConfig.questionCount = count;
    }
    
    currentConfig = { ...currentConfig, ...newConfig };
    logWithTimestamp('Zaktualizowana konfiguracja: ' + JSON.stringify(currentConfig));
    
    const saved = saveConfig();
    logWithTimestamp('Zapisano konfigurację: ' + (saved ? 'tak' : 'nie'));
    
    return currentConfig;
}

/**
 * Resetuje konfigurację do domyślnych wartości
 * @returns {Object} Zresetowana konfiguracja
 */
function resetConfig() {
    logWithTimestamp('Resetowanie konfiguracji do domyślnych wartości');
    currentConfig = { ...defaultConfig };
    saveConfig();
    return currentConfig;
}

/**
 * Zwraca aktualną konfigurację
 * @returns {Object} Aktualna konfiguracja
 */
function getConfig() {
    logWithTimestamp('Pobieranie aktualnej konfiguracji: ' + JSON.stringify(currentConfig));
    return { ...currentConfig };
}

/**
 * Wyszukuje dostępne pliki z pytaniami
 * @returns {Array} Lista plików
 */
function findAvailableQuestionFiles() {
    logWithTimestamp('Wyszukiwanie dostępnych plików z pytaniami...');
    const files = [];
    
    if (!isLocalStorageAvailable()) {
        logWithTimestamp('Nie można wyszukać plików - localStorage niedostępny', 'error');
        return ['Janko.csv'];
    }
    
    try {
        // Zawsze dodaj domyślny plik Janko.csv do listy, nawet jeśli nie ma go w localStorage
        if (!files.includes('Janko.csv')) {
            files.push('Janko.csv');
            logWithTimestamp('Dodano domyślny plik Janko.csv do listy dostępnych plików');
        }
        
        // Wyszukaj pliki w localStorage
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('file_') && key.endsWith('.csv')) {
                const filename = key.substring(5);
                if (!files.includes(filename)) {
                    files.push(filename);
                    logWithTimestamp(`Znaleziono plik w localStorage: ${filename}`);
                }
            }
        }
        
        logWithTimestamp('Znaleziono pliki: ' + JSON.stringify(files));
        return files;
    } catch (error) {
        logWithTimestamp('Błąd podczas wyszukiwania plików: ' + error.message, 'error');
        return ['Janko.csv'];
    }
}

// Inicjalizacja konfiguracji
function initConfig() {
    logWithTimestamp('Inicjalizacja konfiguracji...');
    
    // Sprawdź, czy localStorage jest dostępny
    if (isLocalStorageAvailable()) {
        logWithTimestamp('localStorage jest dostępny, ładuję konfigurację...');
        currentConfig = loadConfig();
    } else {
        logWithTimestamp('localStorage nie jest dostępny, używam domyślnej konfiguracji');
        currentConfig = { ...defaultConfig };
    }
}

// Eksportuj funkcje do globalnego obiektu window
window.quizConfig = {
    updateConfig,
    resetConfig,
    getConfig,
    findAvailableQuestionFiles
};

// Inicjalizacja
initConfig(); 