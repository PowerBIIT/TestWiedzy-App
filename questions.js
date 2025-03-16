/**
 * Module to load and parse quiz questions from the Pytania.csv file
 */

// This will hold our questions after loading
let quizQuestions = [];

/**
 * Funkcja do logowania z timestampem
 * @param {string} message - Wiadomość do zalogowania
 * @param {string} level - Poziom logowania (info, warn, error)
 */
function logWithTimestamp(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}`;
    
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
 * Parses a line from the Pytania.csv file into a question object
 * @param {string} line - A line from the file
 * @returns {object|null} - Question object or null if invalid
 */
function parseQuestionLine(line) {
    // Skip header line if present
    if (line.startsWith("Pytanie,Odpowiedź") || line.trim() === '') {
        logWithTimestamp(`Pomijam linię nagłówka lub pustą: "${line}"`);
        return null;
    }
    
    logWithTimestamp(`Przetwarzanie linii: "${line}"`);
    
    // The format is CSV, but we need to handle the quoted fields properly
    const regex = /"([^"]*)"|([^,]+)/g;
    const matches = [...line.matchAll(regex)];
    
    if (matches.length < 6) {
        logWithTimestamp(`Nieprawidłowy format pytania (znaleziono ${matches.length} pól, wymagane min. 6): "${line}"`, 'error');
        return null;
    }
    
    // Extract the components (handling both quoted and unquoted formats)
    const extractField = (match) => match[1] !== undefined ? match[1] : match[0];
    
    try {
        // Pobierz oryginalne pytanie
        let question = extractField(matches[0]);
        
        // Usuń numer pytania (np. "1. ", "2. ", itd.) z treści pytania
        question = question.replace(/^\d+\.\s*/, '');
        
        const options = [
            { text: extractField(matches[1]), id: 'A' },
            { text: extractField(matches[2]), id: 'B' },
            { text: extractField(matches[3]), id: 'C' },
            { text: extractField(matches[4]), id: 'D' }
        ];
        const correctAnswer = extractField(matches[5]);
        
        logWithTimestamp(`Poprawnie sparsowano pytanie: "${question}" z odpowiedzią: "${correctAnswer}"`);
        
        return {
            question,
            options,
            correctAnswer
        };
    } catch (error) {
        logWithTimestamp(`Błąd podczas parsowania linii: "${line}". Szczegóły: ${error.message}`, 'error');
        return null;
    }
}

// Statyczne dane pytań jako rozwiązanie awaryjne
const staticQuizData = `Pytanie,Odpowiedź A,Odpowiedź B,Odpowiedź C,Odpowiedź D,Poprawna odpowiedź
"1. Jak miał na imię główny bohater utworu?",Jan,Janko,Jaś,Janek,B
"2. Kim z zawodu była matka Janka?",Nauczycielką,Komornicą,Kucharką,Praczką,B
"3. Co szczególnie interesowało Janka?",Rzemiosło,Książki,Muzyka,Sport,C
"4. Jakie przezwisko nadali Jankowi ludzie ze wsi?",Muzykant,Marzyciel,Leń,Dziwak,A
"5. Jakie instrumenty zrobił sobie Janko?","Flet z trzciny","Skrzypce z gonta i włosienia końskiego",Bębenek z garnka,Harmonijkę z liści,B
"6. Co robił Janko nocą pod karczmą?",Tańczył,Pił alkohol,Słuchał muzyki,Spał,C
"7. Co sprawiło, że Janko został oskarżony o kradzież?",Pieniądze,Chleb,Jabłka,Skrzypce,D
"8. Kto wymierzył Jankowi karę?",Wójt,"Stójka Stach",Matka,Nauczyciel,B
"9. Jakie było ostatnie życzenie umierającego Janka?",Zobaczyć ojca,"Dostać prawdziwe skrzypce w niebie",Pojechać do miasta,Zjeść słodycze,B
"10. Jaką postawę wobec chłopskiego talentu prezentowali ludzie z dworu?",Podziwu,Zainteresowania,"Obojętności i ignorancji",Wsparcia,C
"11. W jakim stanie zdrowia był Janko przez większość swojego życia?",Był silny i zdrowy,"Był chorowity i słaby",Miał tylko problemy ze wzrokiem,Był niepełnosprawny,B
"12. Co robiła matka Janka, gdy ten zamiast zbierać jagody słuchał dźwięków lasu?",Chwaliła go,Biła go,Wysyłała go do szkoły,Uczyła go grać,B
"13. Co podkreśla Sienkiewicz w opisie wyglądu Janka?",Jego urodę,Jego podobieństwo do ojca,"Jego chudość i bladość",Jego siłę,C
"14. Jak zareagowała matka na śmierć Janka?",Ulżyło jej,"Rozpaczała głośno",Przyjęła to spokojnie,Obwiniała siebie,B
"15. Co symbolizuje postać Janka Muzykanta w utworze?",Lenistwo chłopskich dzieci,Siłę chłopskiego charakteru,"Zmarnowany talent artystyczny","Szczęśliwe dzieciństwo na wsi",C
"16. Jakie skrzypce zobaczył Janko w kredensie?",Zabawkowe,Zepsute,Prawdziwe,Własnoręcznie wykonane,C
"17. Kto wrócił do dworu z Włoch po śmierci Janka?",Ksiądz,Jego ojciec,"Państwo z panną i kawalerem",Nauczyciel muzyki,C
"18. Co mówił kawaler o Włoszech w kontekście talentów?",Że tam nie ma artystów,"Że szczęściem jest wyszukiwać tam talenty i je wspierać",Że włoscy artyści nie mają talentu,Że polscy artyści są lepsi,B
"19. Gdzie Janko najczęściej słyszał granie muzyki?",W kościele,W szkole,"W karczmie i w lesie",W domu,C
"20. Jakie drzewa szumiały nad grobem Janka?",Sosny,Dęby,Brzozy,Lipy,C`;

/**
 * Przykładowe treści dla dodatkowych plików
 */
const staticQuizExtraData = {
    'Pytania2.csv': `Pytanie,Odpowiedź A,Odpowiedź B,Odpowiedź C,Odpowiedź D,Poprawna odpowiedź
"1. Co to jest HTML?","Hyper Text Markup Language","High Tech Multi Language","Home Tool Markup Language","Hyperlinks and Text Markup Language",A
"2. Który element HTML definiuje ważny tekst?","<important>","<strong>","<b>","<i>",B
"3. Który język programowania jest używany do stylizacji stron internetowych?",HTML,CSS,Python,Java,B
"4. Co to jest JavaScript?","Język programowania","System operacyjny","Baza danych","Protokół sieciowy",A
"5. Który atrybut HTML określa alternatywny tekst dla obrazu?","src","alt","title","href",B`,

    'Pytania_literatura.csv': `Pytanie,Odpowiedź A,Odpowiedź B,Odpowiedź C,Odpowiedź D,Poprawna odpowiedź
"1. Kto napisał epopeję Pan Tadeusz?","Juliusz Słowacki","Adam Mickiewicz","Henryk Sienkiewicz","Cyprian Kamil Norwid",B
"2. Kto jest autorem Lalki?","Eliza Orzeszkowa","Henryk Sienkiewicz","Bolesław Prus","Maria Konopnicka",C
"3. Który utwór nie został napisany przez Henryka Sienkiewicza?","Potop","Quo Vadis","Wesele","Ogniem i mieczem",C`,

    'Pytania_historia.csv': `Pytanie,Odpowiedź A,Odpowiedź B,Odpowiedź C,Odpowiedź D,Poprawna odpowiedź
"1. W którym roku miał miejsce chrzest Polski?",966,1000,1025,1047,A
"2. Kto był pierwszym królem Polski?","Mieszko I","Bolesław Chrobry","Kazimierz Wielki","Władysław Łokietek",B
"3. Kiedy wybuchło Powstanie Warszawskie?","1 września 1939","1 sierpnia 1944","3 maja 1791","17 września 1939",B`
};

/**
 * Loads questions from a selected file based on configuration
 * @returns {Promise<Array>} - Promise resolving to array of question objects
 */
async function loadQuestions() {
    try {
        // Pobierz aktualną konfigurację
        const config = window.quizConfig ? window.quizConfig.getConfig() : { questionFile: 'Janko.csv', questionCount: 20 };
        const filename = config.questionFile || 'Janko.csv';
        
        logWithTimestamp(`Rozpoczynam ładowanie pytań z pliku: ${filename}`);
        
        let text;
        
        // Najpierw sprawdź, czy plik istnieje w localStorage
        const localStorageKey = `file_${filename}`;
        const localStorageContent = localStorage.getItem(localStorageKey);
        
        if (localStorageContent) {
            logWithTimestamp(`Znaleziono plik ${filename} w localStorage, używam jego zawartości`);
            text = localStorageContent;
        } else {
            // Jeśli nie ma w localStorage, spróbuj pobrać przez fetch
            try {
                logWithTimestamp(`Plik ${filename} nie istnieje w localStorage, próba pobrania przez fetch`);
                const response = await fetch(filename);
                if (!response.ok) {
                    logWithTimestamp(`Błąd pobierania pliku ${filename}: ${response.status} ${response.statusText}`, 'error');
                    throw new Error(`Nie udało się załadować pliku ${filename}`);
                }
                text = await response.text();
                
                // Zapisz zawartość pliku do localStorage dla przyszłego użycia
                try {
                    localStorage.setItem(localStorageKey, text);
                    logWithTimestamp(`Zapisano zawartość pliku ${filename} do localStorage dla przyszłego użycia`);
                } catch (saveError) {
                    logWithTimestamp(`Nie udało się zapisać zawartości pliku ${filename} do localStorage: ${saveError.message}`, 'warn');
                }
                
                logWithTimestamp(`Pomyślnie pobrano plik ${filename} przez fetch, długość tekstu: ${text.length} znaków`);
            } catch (fetchError) {
                logWithTimestamp(`Nie udało się załadować pliku ${filename} przez fetch: ${fetchError.message}`, 'warn');
                
                // Użyj statycznych danych w przypadku problemów z fetch
                if (filename === 'Janko.csv') {
                    logWithTimestamp(`Używam statycznych danych dla domyślnego pliku ${filename}`);
                    text = staticQuizData;
                    
                    // Zapisz statyczne dane do localStorage, aby były dostępne w przyszłości
                    try {
                        localStorage.setItem(localStorageKey, text);
                        logWithTimestamp(`Zapisano domyślną zawartość pliku ${filename} do localStorage`);
                    } catch (saveError) {
                        logWithTimestamp(`Nie udało się zapisać domyślnej zawartości pliku ${filename} do localStorage: ${saveError.message}`, 'warn');
                    }
                } else if (staticQuizExtraData[filename]) {
                    logWithTimestamp(`Używam statycznych danych dla pliku ${filename} z staticQuizExtraData`);
                    text = staticQuizExtraData[filename];
                } else {
                    logWithTimestamp(`Brak danych dla pliku ${filename}, używam domyślnych statycznych danych`);
                    text = staticQuizData;
                }
            }
        }
        
        // Split by lines and process each line
        const lines = text.split('\n');
        logWithTimestamp(`Podzielono tekst na ${lines.length} linii`);
        
        let parsedQuestions = lines
            .map(parseQuestionLine)
            .filter(q => q !== null);
        
        logWithTimestamp(`Pomyślnie sparsowano ${parsedQuestions.length} pytań z ${lines.length} linii`);
        
        if (parsedQuestions.length === 0) {
            logWithTimestamp('Nie znaleziono żadnych pytań po parsowaniu', 'error');
            throw new Error('Nie znaleziono żadnych pytań');
        }
        
        // Shuffle questions if configured
        if (config.shuffleQuestions) {
            logWithTimestamp('Mieszanie kolejności pytań');
            parsedQuestions = shuffleArray(parsedQuestions);
        }
        
        // Limit questions to configured count
        if (config.questionCount && config.questionCount < parsedQuestions.length) {
            logWithTimestamp(`Ograniczanie liczby pytań do ${config.questionCount} (z ${parsedQuestions.length})`);
            parsedQuestions = parsedQuestions.slice(0, config.questionCount);
        }
        
        quizQuestions = parsedQuestions;
        
        logWithTimestamp(`Załadowano ${quizQuestions.length} pytań z pliku ${filename}`);
        return quizQuestions;
    } catch (error) {
        logWithTimestamp(`Błąd podczas ładowania pytań: ${error.message}`, 'error');
        return [];
    }
}

/**
 * Losuje kolejność elementów w tablicy
 * @param {Array} array - Tablica do wymieszania
 * @returns {Array} - Wymieszana tablica
 */
function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

/**
 * Returns a copy of the questions array
 * @returns {Array} - Array of question objects
 */
function getQuestions() {
    logWithTimestamp(`Pobieranie pytań, obecnie dostępnych: ${quizQuestions.length}`);
    return [...quizQuestions];
}

/**
 * Tworzy przykładowe pliki z pytaniami do testów
 * @returns {Promise<void>}
 */
async function createSampleFiles() {
    if (!window.quizAdmin) {
        window.quizAdmin = {};
    }
    
    window.quizAdmin.sampleFiles = staticQuizExtraData;
    console.log('Przygotowano przykładowe pliki z pytaniami');
}

// Export the functions
window.quizAPI = {
    loadQuestions,
    getQuestions,
    createSampleFiles
}; 