# Quiz Application

Aplikacja quizowa umożliwiająca ładowanie pytań z plików Markdown i ich prezentację użytkownikowi z czterema opcjami odpowiedzi.

## Features

- Ładowanie pytań z różnych plików w formacie Markdown (.md)
- Prezentacja jednego pytania na raz z 4 opcjami odpowiedzi
- Natychmiastowa informacja zwrotna po wybraniu odpowiedzi
- Śledzenie wyniku podczas całego quizu
- Wyświetlanie końcowych wyników z procentowym wynikiem
- Responsywny design działający na urządzeniach stacjonarnych i mobilnych
- **Panel administracyjny** do konfiguracji i zarządzania testami
- Możliwość wyboru **źródła pytań** i **liczby pytań** w quizie
- Ładowanie pytań z wielu plików i zarządzanie nimi

## Jak uruchomić aplikację

1. Upewnij się, że wszystkie pliki projektu znajdują się w tym samym katalogu:
   - `index.html` - Główna strona quizu
   - `admin.html` - Panel administracyjny
   - `styles.css` - Style CSS
   - `script.js` - Główny plik JavaScript z logiką quizu
   - `questions.js` - Moduł JavaScript do ładowania i parsowania pytań
   - `config.js` - Moduł zarządzania konfiguracją
   - `admin.js` - Logika panelu administracyjnego
   - `Pytania.md` - Plik źródłowy z pytaniami w formacie Markdown

2. Otwórz plik `index.html` w przeglądarce internetowej.
   
   > **Uwaga:** Ze względu na ograniczenia bezpieczeństwa przeglądarki podczas ładowania lokalnych plików, może być konieczne uruchomienie aplikacji za pomocą lokalnego serwera deweloperskiego.

3. Aby użyć lokalnego serwera deweloperskiego, możesz zastosować jedną z tych metod:

   - **Użycie Pythona**:
     ```
     # Dla Pythona 3.x
     python -m http.server
     ```
     Następnie otwórz http://localhost:8000 w przeglądarce.

   - **Użycie Node.js**:
     ```
     # Zainstaluj http-server globalnie, jeśli jeszcze tego nie zrobiłeś
     npm install -g http-server
     
     # Uruchom serwer
     http-server
     ```
     Następnie otwórz http://localhost:8080 w przeglądarce.

## Panel Administracyjny

Nowa funkcja panelu administracyjnego (dostępna pod adresem `admin.html`) pozwala na:

1. **Konfigurację quizu**:
   - Wybór pliku z pytaniami
   - Określenie liczby pytań w quizie
   - Włączenie/wyłączenie losowej kolejności pytań

2. **Zarządzanie plikami z pytaniami**:
   - Przeglądanie dostępnych plików
   - Dodawanie nowych plików z pytaniami
   - Edytowanie istniejących plików

## Format pytań

Plik `Pytania.md` powinien zawierać pytania w następującym formacie:

```
"Treść pytania",Odpowiedź A,Odpowiedź B,Odpowiedź C,Odpowiedź D,Poprawna odpowiedź
```

Na przykład:

```
"1. Jak miał na imię główny bohater utworu?",Jan,Janko,Jaś,Janek,B
```

Gdzie ostatnia kolumna (B) wskazuje, że prawidłową odpowiedzią jest druga opcja (Janko).

## Dostosowanie

Aby zmodyfikować quiz:

1. Edytuj plik `Pytania.md` (lub dodaj nowe pliki przez panel administracyjny), aby zmienić pytania i odpowiedzi
2. Dostosuj style w `styles.css`, aby zmienić wygląd
3. Zmodyfikuj logikę w `script.js`, aby zmienić zachowanie quizu

## Struktura projektu

- `index.html` - Główny plik HTML ze strukturą aplikacji
- `admin.html` - Panel administracyjny do zarządzania quizem
- `styles.css` - Stylizacja CSS aplikacji
- `script.js` - Główny plik JavaScript z logiką quizu
- `questions.js` - Moduł JavaScript do ładowania i parsowania pytań
- `config.js` - Moduł zarządzania konfiguracją
- `admin.js` - Logika panelu administracyjnego
- `Pytania.md` - Plik źródłowy z pytaniami w formacie Markdown

## Licencja

Ten projekt jest open source i dostępny na licencji MIT.

## Wdrażanie aplikacji na Firebase Hosting

### Wymagania wstępne
- Node.js zainstalowany na komputerze
- Konto Google
- Git zainstalowany na komputerze

### Kroki wdrażania

1. **Utwórz projekt Firebase**
   - Wejdź na stronę [firebase.google.com](https://firebase.google.com)
   - Zaloguj się na konto Google
   - Kliknij "Go to console" i "Add project"
   - Nazwij projekt i postępuj zgodnie z instrukcjami

2. **Zainstaluj Firebase CLI**
   ```
   npm install -g firebase-tools
   ```

3. **Zaloguj się do Firebase**
   ```
   firebase login
   ```

4. **Zainicjuj projekt Firebase w katalogu z aplikacją**
   ```
   firebase init
   ```
   - Wybierz "Hosting"
   - Wybierz swój projekt Firebase
   - Określ katalog publiczny: "public"
   - Odpowiedz "No" na pytanie o jednostronicową aplikację (SPA)
   - Odpowiedz "No" na pytanie o automatyczne wdrażanie z GitHub Actions (chyba że chcesz skonfigurować CI/CD)

5. **Skopiuj pliki aplikacji do katalogu public**
   ```
   Copy-Item index.html styles.css script.js config.js questions.js admin.html admin.js -Destination public/
   ```
   Alternatywnie możesz kopiować pliki pojedynczo:
   ```
   Copy-Item index.html -Destination public/
   Copy-Item styles.css -Destination public/
   Copy-Item script.js -Destination public/
   Copy-Item config.js -Destination public/
   Copy-Item questions.js -Destination public/
   Copy-Item admin.html -Destination public/
   Copy-Item admin.js -Destination public/
   ```

6. **Wdróż aplikację**
   ```
   firebase deploy
   ```

7. **Gotowe!**
   Po zakończeniu wdrażania, otrzymasz URL aplikacji (np. https://twoj-projekt.web.app).

### Rozwiązywanie problemów

1. **Jeśli Firebase nie widzi wszystkich plików**
   - Upewnij się, że wszystkie pliki zostały poprawnie skopiowane do katalogu public
   - Sprawdź zawartość katalogu public przed wdrożeniem

2. **Jeśli pojawia się błąd o braku Firestore**
   - Możesz utworzyć bazę danych Firestore w konsoli Firebase lub
   - Zainicjuj ponownie projekt tylko z hostingiem: `firebase init hosting`

### Aktualizacja aplikacji

Aby zaktualizować aplikację po wprowadzeniu zmian:

1. Skopiuj zmienione pliki do katalogu public
2. Wdróż ponownie za pomocą `firebase deploy`

### Automatyczne wdrażanie z GitHub

Możesz skonfigurować automatyczne wdrażanie za każdym razem, gdy wysyłasz zmiany do repozytorium GitHub:

1. Podczas inicjalizacji Firebase wybierz "Yes" przy pytaniu o GitHub Actions
2. Podaj nazwę repozytorium w formacie "użytkownik/nazwa-repo"
3. Po skonfigurowaniu, każdy push do głównej gałęzi automatycznie wdroży aplikację 