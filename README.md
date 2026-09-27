# 📚 AI Study Buddy

An AI-powered web app that turns your study notes or uploaded PDFs into custom multiple-choice quizzes — helping students test their understanding instantly.

## ✨ Features

- 📝 Paste notes directly or upload a PDF (text is extracted automatically)
- 🎯 Choose the number of questions and difficulty level (Easy / Medium / Hard)
- 🤖 AI-generated multiple-choice questions using the Gemini API
- ✅ Interactive quiz — select answers, then submit to see results
- 📊 Instant scoring with percentage and feedback message

## 🛠️ Tech Stack

- HTML, CSS, JavaScript (vanilla, no frameworks)
- [Gemini API](https://ai.google.dev/) for AI-generated quiz questions
- [pdf.js](https://mozilla.github.io/pdf.js/) for in-browser PDF text extraction

## 🚀 Getting Started

1. Clone this repository
git clone https://github.com/srushtivjeedi-dev/ai-study-buddy.git
2. Get a free Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey)
3. Create a file called `config.js` in the project folder with the following content:
```javascript
   const API_KEY = "YOUR_GEMINI_API_KEY_HERE";
```
4. Open `index.html` with a local server (e.g., VS Code's Live Server extension)
5. Paste your notes or upload a PDF, choose your settings, and click **Generate Quiz**

## 📌 Notes

- This project calls the Gemini API directly from the browser for simplicity — in a production environment, API calls like this should go through a backend server to keep the key private.
- `config.js` is excluded from version control via `.gitignore` to protect the API key.

## 📸 Screenshots

*(Add a screenshot or two of your app here once deployed!)*

## 🔮 Possible Future Improvements

- Timed quiz mode
- Support for more file types (Word docs, images with OCR)
- Save quiz history / progress tracking 