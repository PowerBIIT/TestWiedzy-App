/**
 * Moduł do zarządzania konfiguracją quizu
 */

// Domyślna konfiguracja
const defaultConfig = {
    questionFile: 'Pytania.md',
    questionCount: 20,
    shuffleQuestions: true
};

// Aktualna konfiguracja
let currentConfig = { ...defaultConfig };

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
        console.log('Test localStorage: ' + (result ? 'dostępny' : 'niedostępny'));
        return result;
    } catch (e) {
        console.error('localStorage nie jest dostępny:', e);
        return false;
    }
}

/**
 * Zapisuje konfigurację do localStorage
 */
function saveConfig() {
    console.log('Próba zapisania konfiguracji do localStorage...');
    
    if (!isLocalStorageAvailable()) {
        console.error('Nie można zapisać konfiguracji - localStorage niedostępny');
        return false;
    }
    
    try {
        localStorage.setItem('quizConfig', JSON.stringify(currentConfig));
        console.log('Konfiguracja zapisana w localStorage:', currentConfig);
        return true;
    } catch (error) {
        console.error('Błąd podczas zapisywania konfiguracji do localStorage:', error);
        return false;
    }
}

/**
 * Wczytuje konfigurację z localStorage
 * @returns {Object} Konfiguracja
 */
function loadConfig() {
    console.log('Próba wczytania konfiguracji z localStorage...');
    
    if (!isLocalStorageAvailable()) {
        console.error('Nie można wczytać konfiguracji - localStorage niedostępny');
        console.log('Używam domyślnej konfiguracji:', defaultConfig);
        return { ...defaultConfig };
    }
    
    try {
        const storedConfig = localStorage.getItem('quizConfig');
        
        if (storedConfig) {
            const parsedConfig = JSON.parse(storedConfig);
            console.log('Wczytana konfiguracja z localStorage:', parsedConfig);
            return parsedConfig;
        } else {
            console.log('Brak zapisanej konfiguracji. Używam domyślnej:', defaultConfig);
            return { ...defaultConfig };
        }
    } catch (error) {
        console.error('Błąd podczas wczytywania konfiguracji z localStorage:', error);
        console.log('Używam domyślnej konfiguracji:', defaultConfig);
        return { ...defaultConfig };
    }
}

/**
 * Aktualizuje konfigurację
 * @param {Object} newConfig - Nowa konfiguracja
 * @returns {Object} Zaktualizowana konfiguracja
 */
function updateConfig(newConfig) {
    console.log('Aktualizacja konfiguracji. Otrzymano:', newConfig);
    
    if (typeof newConfig !== 'object') {
        console.error('Nieprawidłowy format konfiguracji:', newConfig);
        return currentConfig;
    }
    
    if (newConfig.questionCount !== undefined) {
        // Sprawdź, czy questionCount jest liczbą
        const count = parseInt(newConfig.questionCount, 10);
        if (isNaN(count) || count < 1) {
            console.error('Nieprawidłowa wartość questionCount:', newConfig.questionCount);
            return currentConfig;
        }
        newConfig.questionCount = count;
    }
    
    currentConfig = { ...currentConfig, ...newConfig };
    console.log('Zaktualizowana konfiguracja:', currentConfig);
    
    const saved = saveConfig();
    console.log('Zapisano konfigurację:', saved);
    
    return currentConfig;
}

/**
 * Resetuje konfigurację do domyślnych wartości
 * @returns {Object} Zresetowana konfiguracja
 */
function resetConfig() {
    console.log('Resetowanie konfiguracji do domyślnych wartości');
    currentConfig = { ...defaultConfig };
    saveConfig();
    return currentConfig;
}

/**
 * Zwraca aktualną konfigurację
 * @returns {Object} Aktualna konfiguracja
 */
function getConfig() {
    console.log('Pobieranie aktualnej konfiguracji:', currentConfig);
    return { ...currentConfig };
}

/**
 * Wyszukuje dostępne pliki z pytaniami
 * @returns {Array} Lista plików
 */
function findAvailableQuestionFiles() {
    console.log('Wyszukiwanie dostępnych plików z pytaniami...');
    const files = [];
    
    if (!isLocalStorageAvailable()) {
        console.error('Nie można wyszukać plików - localStorage niedostępny');
        return ['Pytania.md'];
    }
    
    try {
        // Sprawdź, czy domyślny plik istnieje
        if (!localStorage.getItem('file_Pytania.md')) {
            console.log('Tworzenie domyślnego pliku Pytania.md');
            localStorage.setItem('file_Pytania.md', `"1. Przykładowe pytanie?",Odpowiedź A,Odpowiedź B,Odpowiedź C,Odpowiedź D,A`);
        }
        
        // Wyszukaj pliki w localStorage
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('file_') && key.endsWith('.md')) {
                const filename = key.substring(5);
                files.push(filename);
            }
        }
        
        console.log('Znaleziono pliki:', files);
        return files;
    } catch (error) {
        console.error('Błąd podczas wyszukiwania plików:', error);
        return ['Pytania.md'];
    }
}

// Inicjalizacja konfiguracji
function initConfig() {
    console.log('Inicjalizacja konfiguracji...');
    
    // Sprawdź, czy localStorage jest dostępny
    if (isLocalStorageAvailable()) {
        console.log('localStorage jest dostępny, ładuję konfigurację...');
        currentConfig = loadConfig();
    } else {
        console.warn('localStorage nie jest dostępny, używam domyślnej konfiguracji');
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