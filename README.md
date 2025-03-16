# Quiz Application

A simple quiz application that loads questions from a Markdown file and presents them to the user with four options.

## Features

- Loads questions from `Pytania.md`
- Presents one question at a time with 4 answer options
- Provides immediate feedback on answer selection
- Tracks score throughout the quiz
- Shows final results with percentage score
- Responsive design works on desktop and mobile devices

## How to Run

1. Make sure all the project files are in the same directory:
   - `index.html`
   - `styles.css`
   - `script.js`
   - `questions.js`
   - `Pytania.md`

2. Open the `index.html` file in a web browser.
   
   > **Note:** Due to browser security restrictions when loading local files, you may need to run the app using a local development server.

3. To use a local development server, you can use one of these methods:

   - **Using Python**:
     ```
     # For Python 3.x
     python -m http.server
     ```
     Then open http://localhost:8000 in your browser.

   - **Using Node.js**:
     ```
     # Install http-server globally if you haven't already
     npm install -g http-server
     
     # Run the server
     http-server
     ```
     Then open http://localhost:8080 in your browser.

## Project Structure

- `index.html`: Main HTML file with the application structure
- `styles.css`: CSS styling for the application
- `script.js`: Main JavaScript file with quiz logic
- `questions.js`: JavaScript module to load and parse questions
- `Pytania.md`: Source file with quiz questions in Markdown format

## Question Format

The `Pytania.md` file should contain questions in the following format:

```
"Question Text",Answer A,Answer B,Answer C,Answer D,Correct Answer Letter
```

For example:

```
"1. Jak miał na imię główny bohater utworu?",Jan,Janko,Jaś,Janek,B
```

Where the last column (B) indicates that the correct answer is the second option (Janko).

## Customization

To modify the quiz:

1. Edit the `Pytania.md` file to change the questions and answers
2. Adjust the styles in `styles.css` to change the appearance
3. Modify the logic in `script.js` to change the behavior of the quiz

## License

This project is open source and available under the MIT License. 