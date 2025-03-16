/**
 * Module to load and parse quiz questions from the Pytania.md file
 */

// This will hold our questions after loading
let quizQuestions = [];

/**
 * Parses a line from the Pytania.md file into a question object
 * @param {string} line - A line from the file
 * @returns {object|null} - Question object or null if invalid
 */
function parseQuestionLine(line) {
    // Skip header line if present
    if (line.startsWith("Pytanie,Odpowiedź") || line.trim() === '') {
        return null;
    }
    
    // The format is CSV, but we need to handle the quoted fields properly
    const regex = /"([^"]*)"|([^,]+)/g;
    const matches = [...line.matchAll(regex)];
    
    if (matches.length < 6) {
        console.error("Invalid question format:", line);
        return null;
    }
    
    // Extract the components (handling both quoted and unquoted formats)
    const extractField = (match) => match[1] !== undefined ? match[1] : match[0];
    
    return {
        question: extractField(matches[0]),
        options: [
            { text: extractField(matches[1]), id: 'A' },
            { text: extractField(matches[2]), id: 'B' },
            { text: extractField(matches[3]), id: 'C' },
            { text: extractField(matches[4]), id: 'D' }
        ],
        correctAnswer: extractField(matches[5])
    };
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
 * Loads questions from the Pytania.md file
 * @returns {Promise<Array>} - Promise resolving to array of question objects
 */
async function loadQuestions() {
    try {
        let text;
        
        try {
            // Próba załadowania pytań z pliku
            const response = await fetch('Pytania.md');
            if (!response.ok) {
                throw new Error('Nie udało się załadować pliku');
            }
            text = await response.text();
        } catch (fetchError) {
            console.warn("Nie udało się załadować pliku Pytania.md, używam danych statycznych", fetchError);
            // Użyj statycznych danych w przypadku problemów z fetch
            text = staticQuizData;
        }
        
        // Split by lines and process each line
        const lines = text.split('\n');
        
        quizQuestions = lines
            .map(parseQuestionLine)
            .filter(q => q !== null);
        
        if (quizQuestions.length === 0) {
            throw new Error('Nie znaleziono żadnych pytań');
        }
        
        console.log('Załadowano pytań:', quizQuestions.length);
        return quizQuestions;
    } catch (error) {
        console.error("Error loading questions:", error);
        return [];
    }
}

/**
 * Returns a copy of the questions array
 * @returns {Array} - Array of question objects
 */
function getQuestions() {
    return [...quizQuestions];
}

// Export the functions
window.quizAPI = {
    loadQuestions,
    getQuestions
}; 