/**
 * Panel administracyjny quizu - logika
 */

// Stan aplikacji
const adminState = {
    availableFiles: [],
    selectedFile: null,
    fileContents: {}
};

// Elementy DOM
const elements = {
    configForm: document.getElementById('config-form'),
    questionFile: document.getElementById('question-file'),
    questionCount: document.getElementById('question-count'),
    shuffleQuestions: document.getElementById('shuffle-questions'),
    resetConfigBtn: document.getElementById('reset-config'),
    saveConfigBtn: document.querySelector('#config-form button[type="submit"]'),
    
    filesContainer: document.getElementById('files-container'),
    addFileForm: document.getElementById('add-file-form'),
    fileName: document.getElementById('file-name'),
    fileContent: document.getElementById('file-content'),
    exampleContentBtn: document.getElementById('example-content'),
    
    editFileForm: document.getElementById('edit-file-form'),
    editFileSelect: document.getElementById('edit-file-select'),
    editFileContent: document.getElementById('edit-file-content'),
    loadFileBtn: document.getElementById('load-file'),
    
    previewModal: null,
    previewContent: document.getElementById('preview-content')
};

/**
 * Inicjalizacja aplikacji
 */
async function initAdmin() {
    console.log('Inicjalizacja panelu administratora...');
    
    // Inicjalizuj modal
    if (document.getElementById('previewModal')) {
        elements.previewModal = new bootstrap.Modal(document.getElementById('previewModal'));
    }
    
    // Załaduj konfigurację
    loadConfig();
    
    // Przygotuj przykładowe pliki
    if (window.quizAPI && window.quizAPI.createSampleFiles) {
        await window.quizAPI.createSampleFiles();
    }
    
    // Załaduj dostępne pliki
    await loadAvailableFiles();
    
    // Ustaw nasłuchiwanie zdarzeń
    setupEventListeners();
    
    console.log('Panel administratora zainicjalizowany.');
}

/**
 * Ładuje konfigurację z localStorage i wypełnia formularz
 */
function loadConfig() {
    console.log('Wczytywanie konfiguracji...');
    try {
        const config = window.quizConfig.getConfig();
        console.log('Wczytana konfiguracja:', config);
        
        if (config) {
            elements.questionFile.value = config.questionFile || 'Pytania.csv';
            elements.questionCount.value = config.questionCount || 20;
            elements.shuffleQuestions.checked = config.shuffleQuestions !== undefined ? config.shuffleQuestions : true;
            console.log('Formularz zaktualizowany wartościami:', {
                questionFile: elements.questionFile.value,
                questionCount: elements.questionCount.value,
                shuffleQuestions: elements.shuffleQuestions.checked
            });
        } else {
            console.warn('Brak konfiguracji do wczytania');
        }
    } catch (error) {
        console.error('Błąd podczas wczytywania konfiguracji:', error);
    }
}

/**
 * Ładuje listę dostępnych plików z pytaniami
 */
async function loadAvailableFiles() {
    try {
        // Pobierz dostępne pliki
        if (!window.quizConfig || !window.quizConfig.findAvailableQuestionFiles) {
            console.error('Funkcja findAvailableQuestionFiles nie jest dostępna!');
            return;
        }
        
        adminState.availableFiles = await window.quizConfig.findAvailableQuestionFiles();
        console.log('Dostępne pliki:', adminState.availableFiles);
        
        // Wypełnij wybór pliku w formularzu konfiguracyjnym
        populateFileSelect(elements.questionFile, adminState.availableFiles);
        
        // Wypełnij wybór pliku w formularzu edycji
        populateFileSelect(elements.editFileSelect, adminState.availableFiles);
        
        // Wyświetl karty plików
        renderFileCards();
        
    } catch (error) {
        console.error('Błąd ładowania plików:', error);
        showAlert('Nie udało się załadować listy plików', 'danger');
    }
}

/**
 * Wypełnia element select opcjami na podstawie listy plików
 * @param {HTMLSelectElement} selectElement - Element select do wypełnienia
 * @param {string[]} files - Lista plików
 */
function populateFileSelect(selectElement, files) {
    if (!selectElement) return;
    
    // Zachowaj aktualnie wybraną wartość
    const currentValue = selectElement.value;
    
    // Wyczyść element select
    selectElement.innerHTML = '';
    
    // Dodaj opcje dla każdego pliku
    files.forEach(file => {
        const option = document.createElement('option');
        option.value = file;
        option.textContent = file;
        selectElement.appendChild(option);
    });
    
    // Przywróć wybraną wartość, jeśli istnieje
    if (files.includes(currentValue)) {
        selectElement.value = currentValue;
    }
}

/**
 * Renderuje karty dla dostępnych plików
 */
function renderFileCards() {
    if (!elements.filesContainer) return;
    
    elements.filesContainer.innerHTML = '';
    
    adminState.availableFiles.forEach(file => {
        const card = document.createElement('div');
        card.className = 'col-md-4';
        card.innerHTML = `
            <div class="card file-card h-100 ${file === adminState.selectedFile ? 'selected' : ''}">
                <div class="card-body">
                    <h5 class="card-title">
                        <i class="bi bi-file-earmark-text me-2"></i>
                        ${file}
                    </h5>
                    <p class="card-text text-muted small">
                        Format: CSV z nagłówkiem<br>
                        <button class="btn btn-sm btn-outline-secondary preview-btn mt-2" data-file="${file}">
                            <i class="bi bi-eye me-1"></i> Podgląd
                        </button>
                    </p>
                </div>
                <div class="card-footer d-flex justify-content-between">
                    <button class="btn btn-sm btn-outline-primary select-file-btn" data-file="${file}">
                        <i class="bi bi-check-circle me-1"></i> Wybierz
                    </button>
                    <button class="btn btn-sm btn-outline-secondary edit-file-btn" data-file="${file}">
                        <i class="bi bi-pencil me-1"></i> Edytuj
                    </button>
                </div>
            </div>
        `;
        
        elements.filesContainer.appendChild(card);
    });
    
    // Dodaj obsługę zdarzeń dla przycisków
    document.querySelectorAll('.preview-btn').forEach(btn => {
        btn.addEventListener('click', () => previewFile(btn.dataset.file));
    });
    
    document.querySelectorAll('.select-file-btn').forEach(btn => {
        btn.addEventListener('click', () => selectFile(btn.dataset.file));
    });
    
    document.querySelectorAll('.edit-file-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (elements.editFileSelect) {
                elements.editFileSelect.value = btn.dataset.file;
                loadFileContent();
                // Otwórz odpowiedni accordion
                const editAccordion = document.querySelector('[data-bs-target="#collapseEditFile"]');
                if (editAccordion && editAccordion.classList.contains('collapsed')) {
                    editAccordion.click();
                }
            }
        });
    });
}

/**
 * Ustawia nasłuchiwanie zdarzeń
 */
function setupEventListeners() {
    console.log('Ustawianie nasłuchiwania zdarzeń...');
    
    // Formularz konfiguracji - podejście z bezpośrednim przyciskiem zamiast zdarzenia submit
    if (elements.saveConfigBtn) {
        console.log('Dodaję nasłuchiwanie dla przycisku zapisu konfiguracji');
        elements.saveConfigBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Przycisk zapisu konfiguracji kliknięty');
            saveConfig();
        });
    } else {
        console.warn('Nie znaleziono przycisku zapisu konfiguracji!');
    }
    
    // Dodatkowe zabezpieczenie - nasłuchiwanie zdarzenia submit formularza
    if (elements.configForm) {
        console.log('Dodaję nasłuchiwanie dla formularza konfiguracji');
        elements.configForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Formularz konfiguracji wysłany');
            saveConfig();
        });
    } else {
        console.warn('Nie znaleziono formularza konfiguracji!');
    }
    
    // Przycisk resetowania konfiguracji
    if (elements.resetConfigBtn) {
        elements.resetConfigBtn.addEventListener('click', resetConfig);
    }
    
    // Formularz dodawania pliku
    if (elements.addFileForm) {
        elements.addFileForm.addEventListener('submit', (e) => {
            e.preventDefault();
            saveNewFile();
        });
    }
    
    // Przycisk przykładowej zawartości
    if (elements.exampleContentBtn) {
        elements.exampleContentBtn.addEventListener('click', insertExampleContent);
    }
    
    // Formularz edycji pliku
    if (elements.editFileForm) {
        elements.editFileForm.addEventListener('submit', (e) => {
            e.preventDefault();
            saveEditedFile();
        });
    }
    
    // Przycisk ładowania pliku
    if (elements.loadFileBtn) {
        elements.loadFileBtn.addEventListener('click', loadFileContent);
    }
    
    console.log('Nasłuchiwanie zdarzeń ustawione.');
}

/**
 * Zapisuje konfigurację
 */
function saveConfig() {
    console.log('Próba zapisania konfiguracji...');
    
    try {
        const config = {
            questionFile: elements.questionFile.value,
            questionCount: parseInt(elements.questionCount.value, 10),
            shuffleQuestions: elements.shuffleQuestions.checked
        };
        
        console.log('Konfiguracja do zapisu:', config);
        
        if (isNaN(config.questionCount) || config.questionCount < 1) {
            console.error('Nieprawidłowa liczba pytań:', config.questionCount);
            alert('Błąd: Nieprawidłowa liczba pytań');
            return;
        }
        
        if (!config.questionFile) {
            console.error('Nie wybrano pliku z pytaniami');
            alert('Błąd: Nie wybrano pliku z pytaniami');
            return;
        }
        
        // Sprawdź, czy window.quizConfig istnieje
        if (!window.quizConfig) {
            console.error('Błąd: window.quizConfig nie istnieje!');
            alert('Błąd: window.quizConfig nie istnieje!');
            return;
        }
        
        // Sprawdź, czy updateConfig to funkcja
        if (typeof window.quizConfig.updateConfig !== 'function') {
            console.error('Błąd: window.quizConfig.updateConfig nie jest funkcją!');
            alert('Błąd: window.quizConfig.updateConfig nie jest funkcją!');
            return;
        }
        
        // Zapisz konfigurację
        const updatedConfig = window.quizConfig.updateConfig(config);
        console.log('Konfiguracja została zaktualizowana:', updatedConfig);
        
        showAlert('Konfiguracja została zapisana', 'success');
    } catch (error) {
        console.error('Błąd podczas zapisywania konfiguracji:', error);
        showAlert('Błąd podczas zapisywania konfiguracji: ' + error.message, 'danger');
    }
}

/**
 * Resetuje konfigurację do wartości domyślnych
 */
function resetConfig() {
    if (!window.quizConfig || !window.quizConfig.resetConfig) {
        console.error('Funkcja resetConfig nie jest dostępna!');
        return;
    }
    
    window.quizConfig.resetConfig();
    loadConfig();
    showAlert('Konfiguracja została zresetowana do wartości domyślnych', 'info');
}

/**
 * Wybiera plik i ustawia go jako aktualny w konfiguracji
 * @param {string} fileName - Nazwa pliku
 */
function selectFile(fileName) {
    adminState.selectedFile = fileName;
    
    if (elements.questionFile) {
        elements.questionFile.value = fileName;
    }
    
    // Zaktualizuj konfigurację
    if (window.quizConfig && window.quizConfig.updateConfig) {
        const config = window.quizConfig.getConfig();
        config.questionFile = fileName;
        window.quizConfig.updateConfig(config);
    }
    
    // Odśwież widok kart
    renderFileCards();
    
    showAlert(`Wybrano plik: ${fileName}`, 'success');
}

/**
 * Pokazuje podgląd zawartości pliku
 * @param {string} fileName - Nazwa pliku
 */
async function previewFile(fileName) {
    try {
        const content = await getFileContent(fileName);
        
        if (elements.previewContent) {
            elements.previewContent.textContent = content;
        }
        
        if (elements.previewModal) {
            elements.previewModal.show();
        }
    } catch (error) {
        console.error('Błąd podglądu pliku:', error);
        showAlert(`Nie udało się wczytać zawartości pliku: ${fileName}`, 'danger');
    }
}

/**
 * Wczytuje zawartość pliku
 */
async function loadFileContent() {
    if (!elements.editFileSelect) return;
    
    const fileName = elements.editFileSelect.value;
    if (!fileName) return;
    
    try {
        const content = await getFileContent(fileName);
        if (elements.editFileContent) {
            elements.editFileContent.value = content;
        }
    } catch (error) {
        console.error('Błąd ładowania zawartości pliku:', error);
        showAlert(`Nie udało się wczytać zawartości pliku: ${fileName}`, 'danger');
    }
}

/**
 * Pobiera zawartość pliku (z pamięci podręcznej lub z serwera)
 * @param {string} fileName - Nazwa pliku
 * @returns {Promise<string>} - Zawartość pliku
 */
async function getFileContent(fileName) {
    if (adminState.fileContents[fileName]) {
        return adminState.fileContents[fileName];
    }
    
    try {
        // Sprawdź, czy plik jest dostępny w statycznych danych
        if (window.quizAdmin && window.quizAdmin.sampleFiles && window.quizAdmin.sampleFiles[fileName]) {
            adminState.fileContents[fileName] = window.quizAdmin.sampleFiles[fileName];
            return adminState.fileContents[fileName];
        }
        
        // Jeśli nie, spróbuj pobrać z serwera
        const response = await fetch(fileName);
        if (!response.ok) {
            throw new Error(`Nie udało się pobrać pliku: ${fileName}`);
        }
        
        const content = await response.text();
        adminState.fileContents[fileName] = content;
        return content;
    } catch (error) {
        console.error(`Błąd pobierania zawartości pliku ${fileName}:`, error);
        
        // Jeśli to plik Pytania.md, użyj statycznych danych
        if (fileName === 'Pytania.csv' && window.staticQuizData) {
            adminState.fileContents[fileName] = window.staticQuizData;
            return window.staticQuizData;
        }
        
        throw error;
    }
}

/**
 * Zapisuje nowy plik
 */
function saveNewFile() {
    if (!elements.fileName || !elements.fileContent) return;
    
    const fileName = elements.fileName.value;
    const content = elements.fileContent.value;
    
    // Sprawdź, czy plik już istnieje
    if (adminState.availableFiles.includes(fileName) && !confirm(`Plik ${fileName} już istnieje. Czy chcesz go nadpisać?`)) {
        return;
    }
    
    // W rzeczywistej aplikacji tutaj byłby kod zapisujący plik na serwerze
    // Dla celów demonstracyjnych zapisujemy tylko w pamięci podręcznej
    adminState.fileContents[fileName] = content;
    
    if (!adminState.availableFiles.includes(fileName)) {
        adminState.availableFiles.push(fileName);
    }
    
    // Zaktualizuj interfejs
    loadAvailableFiles();
    
    if (elements.addFileForm) {
        elements.addFileForm.reset();
    }
    
    showAlert(`Plik ${fileName} został zapisany`, 'success');
    
    // Zamknij accordion
    const addAccordion = document.querySelector('[data-bs-target="#collapseAddFile"]');
    if (addAccordion && !addAccordion.classList.contains('collapsed')) {
        addAccordion.click();
    }
}

/**
 * Zapisuje edytowany plik
 */
function saveEditedFile() {
    if (!elements.editFileSelect || !elements.editFileContent) return;
    
    const fileName = elements.editFileSelect.value;
    const content = elements.editFileContent.value;
    
    // W rzeczywistej aplikacji tutaj byłby kod zapisujący plik na serwerze
    // Dla celów demonstracyjnych zapisujemy tylko w pamięci podręcznej
    adminState.fileContents[fileName] = content;
    
    showAlert(`Zmiany w pliku ${fileName} zostały zapisane`, 'success');
    
    // Zamknij accordion
    const editAccordion = document.querySelector('[data-bs-target="#collapseEditFile"]');
    if (editAccordion && !editAccordion.classList.contains('collapsed')) {
        editAccordion.click();
    }
}

/**
 * Wstawia przykładową zawartość do pola tekstowego
 */
function insertExampleContent() {
    if (!elements.fileContent) return;
    
    elements.fileContent.value = `Pytanie,Odpowiedź A,Odpowiedź B,Odpowiedź C,Odpowiedź D,Poprawna odpowiedź
"1. Co to jest HTML?","Hyper Text Markup Language","High Tech Multi Language","Home Tool Markup Language","Hyperlinks and Text Markup Language",A
"2. Który element HTML definiuje ważny tekst?","<important>","<strong>","<b>","<i>",B
"3. Który język programowania jest używany do stylizacji stron internetowych?",HTML,CSS,Python,Java,B`;
}

/**
 * Wyświetla alert
 * @param {string} message - Treść komunikatu
 * @param {string} type - Typ alertu (success, danger, warning, info)
 */
function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3`;
    alertDiv.style.zIndex = 1050;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        alertDiv.classList.remove('show');
        setTimeout(() => alertDiv.remove(), 300);
    }, 3000);
}

// Sprawdź, czy plik ma poprawne rozszerzenie
function validateFileName(fileName) {
    if (!fileName) {
        showError('Nazwa pliku nie może być pusta');
        return false;
    }
    
    if (!fileName.endsWith('.csv')) {
        showError('Nazwa pliku musi kończyć się na .csv');
        return false;
    }
    
    return true;
}

// Funkcja do tworzenia przykładowych plików
function createSampleFiles() {
    const sampleFiles = {
        'Pytania.csv': staticQuizData,
        'Pytania_literatura.csv': staticQuizExtraData['Pytania_literatura.csv'],
        'Pytania_historia.csv': staticQuizExtraData['Pytania_historia.csv']
    };
    
    // ... existing code ...
}

// Inicjalizacja po załadowaniu dokumentu
document.addEventListener('DOMContentLoaded', initAdmin); 